# Pomodoro Timer Webアプリ アーキテクチャ案

## 1. 目的
このドキュメントは、Flask + HTML/CSS/JavaScriptで実装するポモドーロタイマーWebアプリのアーキテクチャ方針を定義する。

主な目的は以下。
- 開発初期から責務分離を明確にし、拡張しやすい構成にする
- タイマーの時間依存を制御し、正確性を担保する
- ユニットテストしやすい設計を採用する

## 2. 設計原則
- フロントエンド主導: タイマーの進行と画面更新はクライアント側で担当
- サーバ責務の限定: Flaskは設定保存、履歴保存、統計提供を担当
- ドメインロジック分離: 状態遷移とタイマー計算は純粋ロジックとして分離
- 副作用隔離: 時刻取得、永続化アクセス、通知、HTTP通信は抽象化して注入可能にする

## 3. 全体アーキテクチャ
5層構成を採用する。

1. フロントエンド層
- 役割: 表示、ユーザー操作、ローカル状態、タイマー進行
- 技術: HTML/CSS/JavaScript

2. Flaskプレゼンテーション層
- 役割: 画面配信、静的ファイル提供

3. Flask API層
- 役割: 設定API、履歴API、統計API

4. ドメイン層
- 役割: ポモドーロ状態遷移、完了判定、ロングブレーク挿入判定

5. 永続化層
- 役割: 設定値とセッション履歴の保存
- 初期実装: JSONファイル（サーバ側）またはlocalStorage（クライアント側）

## 4. 推奨ディレクトリ構成
初期段階で以下の構成を推奨する。

- app.py
- pomodoro/
  - __init__.py
  - routes/
    - page_routes.py
    - api_routes.py
  - services/
    - pomodoro_service.py
    - stats_service.py
  - domain/
    - timer_state.py
    - transitions.py
    - rules.py
  - repositories/
    - settings_repository.py
    - session_repository.py
    - file_repositories.py
    - in_memory_repositories.py
  - validators/
    - settings_validator.py
  - infrastructure/
    - clock.py
- templates/
  - index.html
- static/
  - css/
    - style.css
  - js/
    - state.js
    - timer_engine.js
    - ui.js
    - api_client.js
- tests/
  - unit/
    - test_transitions.py
    - test_rules.py
    - test_settings_validator.py
  - integration/
    - test_api_settings.py
    - test_api_sessions.py
  - frontend/
    - timer_engine.test.js

## 5. フロントエンド設計
### 5.1 モジュール分割
- state.js
  - アプリ状態を保持（mode, running, paused, remainingSeconds, cycleCountなど）
- timer_engine.js
  - タイマー進行ロジックを担当
  - 終了予定時刻との差分で残り時間を計算し、ドリフトを抑制
- ui.js
  - DOM更新、イベントバインド、通知表示
- api_client.js
  - Flask APIとの通信を一元管理

### 5.2 タイマー精度方針
毎秒カウントダウンで減算するのではなく、以下で計算する。
- start時に終了予定時刻を算出
- 描画更新時に 現在時刻 と 終了予定時刻 の差分で残り秒を再計算

これにより、タブ非アクティブ時や一時的な負荷があっても精度を保ちやすい。

## 6. Flaskバックエンド設計
### 6.1 ルート分離
- ページ配信ルート: index表示
- APIルート: 設定、履歴、統計

### 6.2 ルートは薄く保つ
ルート層の責務は限定する。
- リクエスト受理
- バリデーション呼び出し
- サービス呼び出し
- JSONレスポンス整形

ビジネスロジックはサービス層・ドメイン層へ集約する。

## 7. データモデル
### 7.1 Settings
- work_minutes
- short_break_minutes
- long_break_minutes
- long_break_interval
- auto_start_break
- auto_start_focus
- sound_enabled

### 7.2 SessionLog
- session_type（focus / short_break / long_break）
- planned_seconds
- actual_seconds
- started_at
- ended_at
- completed
- interrupted_reason

## 8. API設計（最小セット）
- GET /api/settings
  - 設定取得
- PUT /api/settings
  - 設定更新
- POST /api/sessions
  - セッション実績記録
- GET /api/stats/daily
  - 日次統計取得
- GET /api/stats/weekly
  - 週次統計取得

## 9. 状態遷移設計
状態は明示的に管理する。

主な状態:
- focus
- short_break
- long_break
- paused

主なイベント:
- start
- pause
- resume
- complete
- skip
- reset

遷移判定は純粋関数として実装する。
例:
- next_state(current_state, event, config)

## 10. テスト容易性のための改善方針
### 10.1 時間依存の抽象化
- datetime.nowの直呼びを禁止
- Clockインターフェース（clock.now）を注入

効果:
- 任意時刻を固定したテストが可能
- 境界時刻の再現が容易

### 10.2 永続化の抽象化
- SettingsRepository / SessionRepositoryをインターフェース化
- 本番はFile実装（JSONファイル）またはLocalStorage実装、テストはInMemory実装

効果:
- ユニットテストで永続化実装依存を排除

### 10.3 副作用の分離
- 通信、通知、スケジューラをラッパー経由にする
- フロントエンドでもsetInterval直呼びを避け、Scheduler抽象を導入

効果:
- 偽タイマーで決定的テストが可能

### 10.4 契約テスト
- APIレスポンスのJSON構造を固定し、契約テストを追加

効果:
- フロントとバックの不整合を早期検知

## 11. テスト戦略
### 11.1 バックエンドユニットテスト
対象:
- 状態遷移
- 完了判定
- ロングブレーク挿入判定
- 設定バリデーション

### 11.2 バックエンド統合テスト
対象:
- APIの正常系と異常系
- バリデーションエラー
- 永続化の反映

### 11.3 フロントエンドユニットテスト
対象:
- タイマー計算
- 表示フォーマット
- モード切替ロジック

### 11.4 最小E2Eテスト
対象:
- 1サイクル完了（開始 → 一時停止 → 再開 → 完了記録）

### 11.5 優先すべき境界ケース
- 残り時間が0になる瞬間
- pause/resumeを複数回繰り返す
- focus N回目でlong_breakに切り替わる境界
- 設定の最小値、最大値、不正値
- 非アクティブタブ復帰後の時間再計算

## 12. 初期開発ステップ
1. フロントエンド単体でタイマー状態遷移を完成
2. Flask APIで設定保存を接続
3. セッション履歴保存と統計APIを追加
4. 通知音、UI調整、アニメーション調整
5. 契約テストと境界テストを拡充

## 13. 将来拡張
- ユーザー認証の導入
- マルチデバイス同期
- タスク管理との連携
- 通知チャネルの追加（ブラウザ通知、音声、外部連携）

## 14. まとめ
本アーキテクチャは、実装のシンプルさと将来拡張性のバランスを重視している。
特に、時間依存と副作用の分離を徹底することで、ポモドーロアプリで重要な正確性とユニットテスト容易性を同時に確保する。