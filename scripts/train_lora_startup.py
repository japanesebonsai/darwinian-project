#!/usr/bin/env python3
"""
Fast LoRA fine-tuning script for startup ideation/advisor tasks.

Designed for a 1-day training run in Google Colab or a local GPU machine.

Example:
  python scripts/train_lora_startup.py \
    --dataset_name adamabuhamdan/startup-advisor-dataset \
    --model_name meta-llama/Llama-3.1-8B-Instruct \
    --output_dir outputs/startup-lora
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List

from datasets import Dataset, load_dataset
from peft import LoraConfig
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from trl import SFTTrainer


SYSTEM_PROMPT = (
    "You are a startup ideation expert. Produce practical, high-impact ideas "
    "with clear rationale, user focus, and realistic execution steps."
)

CONFIG: Dict[str, Any] = {
    "dataset_name": "adamabuhamdan/startup-advisor-dataset",
    "dataset_split": "train",
    "model_name": "meta-llama/Llama-3.1-8B-Instruct",
    "output_dir": "outputs/startup-lora",
    "max_samples": 1500,
    "max_seq_length": 1024,
    "num_train_epochs": 1.0,
    "learning_rate": 2e-5,
    "per_device_train_batch_size": 2,
    "gradient_accumulation_steps": 8,
    "warmup_ratio": 0.03,
    "logging_steps": 10,
    "save_steps": 100,
    "seed": 42,
}


@dataclass
class ParsedExample:
    prompt: str
    response: str


def try_extract_messages(record: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Returns a normalized list of role/content messages if possible.
    Handles common dataset shapes:
      - {"messages": [{"role": "...", "content": "..."}]}
      - {"conversations": [...]}
    """
    if isinstance(record.get("messages"), list):
        return record["messages"]
    if isinstance(record.get("conversations"), list):
        return record["conversations"]
    return []


def record_to_example(record: Dict[str, Any]) -> ParsedExample | None:
    """
    Converts different record formats into prompt/response text.
    """
    messages = try_extract_messages(record)
    if messages:
        user_parts: List[str] = []
        assistant_parts: List[str] = []
        for m in messages:
            role = str(m.get("role", "")).strip().lower()
            content = str(m.get("content", "")).strip()
            if not content:
                continue
            if role == "user":
                user_parts.append(content)
            elif role == "assistant":
                assistant_parts.append(content)
        if user_parts and assistant_parts:
            return ParsedExample(
                prompt="\n\n".join(user_parts),
                response="\n\n".join(assistant_parts),
            )

    # Common fallback format
    prompt = (
        record.get("instruction")
        or record.get("prompt")
        or record.get("question")
        or record.get("input")
        or ""
    )
    response = (
        record.get("output")
        or record.get("response")
        or record.get("answer")
        or ""
    )
    prompt = str(prompt).strip()
    response = str(response).strip()
    if prompt and response:
        return ParsedExample(prompt=prompt, response=response)

    return None


def to_chat_text(tokenizer: AutoTokenizer, prompt: str, response: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
        {"role": "assistant", "content": response},
    ]
    return tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=False,
    )


def build_training_dataset(raw_ds: Dataset, tokenizer: AutoTokenizer, max_samples: int) -> Dataset:
    rows: List[Dict[str, str]] = []
    for i, rec in enumerate(raw_ds):
        if len(rows) >= max_samples:
            break
        parsed = record_to_example(rec)
        if not parsed:
            continue
        # Basic cleaning
        if len(parsed.prompt) < 10 or len(parsed.response) < 10:
            continue
        text = to_chat_text(tokenizer, parsed.prompt, parsed.response)
        rows.append({"text": text})
        if (i + 1) % 500 == 0:
            print(f"Processed {i + 1} rows, kept {len(rows)}")

    if not rows:
        raise ValueError("No valid records found after parsing and cleaning.")

    print(f"Final train examples: {len(rows)}")
    return Dataset.from_list(rows)


def main() -> None:
    cfg = CONFIG
    os.makedirs(cfg["output_dir"], exist_ok=True)

    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(cfg["model_name"], use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print(f'Loading dataset: {cfg["dataset_name"]} [{cfg["dataset_split"]}]')
    raw_ds = load_dataset(cfg["dataset_name"], split=cfg["dataset_split"])
    train_ds = build_training_dataset(raw_ds, tokenizer, cfg["max_samples"])

    # 4-bit quantization for faster/lower-memory training
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype="float16",
        bnb_4bit_use_double_quant=True,
    )

    print("Loading model...")
    model = AutoModelForCausalLM.from_pretrained(
        cfg["model_name"],
        quantization_config=bnb_config,
        device_map="auto",
    )
    model.config.use_cache = False

    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
    )

    training_args = TrainingArguments(
        output_dir=cfg["output_dir"],
        num_train_epochs=cfg["num_train_epochs"],
        learning_rate=cfg["learning_rate"],
        per_device_train_batch_size=cfg["per_device_train_batch_size"],
        gradient_accumulation_steps=cfg["gradient_accumulation_steps"],
        warmup_ratio=cfg["warmup_ratio"],
        logging_steps=cfg["logging_steps"],
        save_steps=cfg["save_steps"],
        save_total_limit=2,
        fp16=True,
        optim="paged_adamw_8bit",
        lr_scheduler_type="cosine",
        weight_decay=0.01,
        seed=cfg["seed"],
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_ds,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=cfg["max_seq_length"],
        args=training_args,
    )

    print("Starting training...")
    trainer.train()

    print("Saving LoRA adapter...")
    trainer.model.save_pretrained(cfg["output_dir"])
    tokenizer.save_pretrained(cfg["output_dir"])

    metadata = {
        "dataset_name": cfg["dataset_name"],
        "dataset_split": cfg["dataset_split"],
        "base_model": cfg["model_name"],
        "max_samples": cfg["max_samples"],
        "max_seq_length": cfg["max_seq_length"],
        "epochs": cfg["num_train_epochs"],
        "learning_rate": cfg["learning_rate"],
    }
    with open(os.path.join(cfg["output_dir"], "training_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f'Done. Adapter saved to: {cfg["output_dir"]}')


if __name__ == "__main__":
    main()
