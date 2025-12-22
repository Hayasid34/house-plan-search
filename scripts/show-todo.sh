#!/bin/bash

# TODOリストを表示するスクリプト
# ターミナル起動時に自動実行される

TODO_FILE="/Users/dw1003/house-plan-search/TODO.md"

if [ -f "$TODO_FILE" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 DandoriFinder TODOリスト"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 緊急タスクのみ表示（最初の30行くらい）
  head -n 35 "$TODO_FILE" | tail -n +5

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 詳細: cat $TODO_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi
