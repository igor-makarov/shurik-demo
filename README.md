# shurik-demo

A small consumer project using [Shurik](https://github.com/igor-makarov/shurik) through a GitHub Action. The TypeScript application has no runtime dependencies and does not contain Shurik's engine source.

Shurik selects providers and models through Pi AI, which handles authentication automatically. The workflow supports OpenAI, Anthropic, and the demo's default DeepSeek model through OpenCode Go. See Shurik's [provider guide](https://github.com/igor-makarov/shurik/blob/v1/README.md#providers-and-authentication) for provider IDs and native authentication variables.

One workflow handles start, stop, resume, iterations and recovery. The iteration job in [.github/workflows/shurik.yml](.github/workflows/shurik.yml) invokes Shurik with the model credential:

```yaml
- uses: igor-makarov/shurik@v1
  env:
    OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
  with:
    command: iterate
    inputs: ${{ toJSON(inputs) }}
```

Control and recovery actions use the repository token and do not need a model credential.

Iteration titles use `Shurik <loop-id> / <n>`, with contiguous numbers across stop/resume: `1, 2, 3, 4, 5 → stop → resume → 6, 7, 8`. Internal generations keep older queued runs separate without appearing in the title. A queued run that never claimed ownership does not consume a number; an interrupted run that did claim ownership does.

Each run uses the current `v1` release. Use `@v2` when you choose to adopt a future major version. Shurik's CLI handles the loop and Pi Durable handles native session history.

## Try it

1. For the default demo, add the repository Actions secret `OPENCODE_API_KEY`. To use OpenAI or Anthropic, add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` instead; the iteration job already exposes these as native environment variables. Other providers use their Pi AI authentication variables in that job's `env`.
2. Optionally enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests** for draft PRs. The `create_pr` workflow input defaults to `auto`, creating a PR when allowed and continuing on the task branch otherwise. Choose `false` to skip PR creation, or `true` to enable it explicitly. The action input is `create-pr`; the CLI flag is `--create-pr`.
3. Read or change [PROMPT.md](PROMPT.md). It asks Shurik to add Spanish greetings with tests and API documentation.
4. In **Actions → Shurik → Run workflow**, use `main`, command `start`, a unique loop ID such as `greeting-demo`, and an explicit reasoning level such as `high`. Leave provider, model, and seconds blank to use `opencode-go` / `deepseek-v4.1-flash` and a two-minute iteration time limit with checkpoints every 60 seconds. Alternatively, select `provider: openai` with `model: gpt-6-sol`, or `provider: anthropic` with `model: claude-haiku-4-5`. These are paid models. Supply a deadline a few minutes in the future to bound the demo. The time limit and deadline are not spending caps.
5. Review task changes on `greeting-demo`, or in its draft PR when enabled. Shurik does not merge it. To checkpoint directly onto `main`, use loop ID `main`; PR creation is automatically disabled for that loop.
6. Use **Shurik → stop** with that loop ID. Resume requires a new explicit reasoning level. The recovery job runs in this same workflow after iteration failure; its schedule also checks every 15 minutes if the entire workflow was interrupted.

A model finishing the greeting task ends one iteration; the outer loop continues until its deadline or a stop. No agent loop starts just from cloning or pushing this repository. Demo CI type-checks the application and tests, then runs `node --test *.test.ts` without model credentials. All authored code is TypeScript.

Start saves provider/model settings on the control branch. Resume keeps them when blank; switching provider requires an explicit model and a new reasoning level. Authentication stays in the runner environment and is resolved by Pi AI, without a Shurik API-key input or credential file in the project.

The loop ID is the task branch name, and its control branch is `shurik-control/<loop-id>`. Existing task branches start from their current remote tip; `source_ref` may select another commit only for a new branch. Use `resume` if a loop with that ID already exists. `shurik-control` is reserved for the control namespace. Earlier loops keep their recorded branches and remain accessible to control and recovery commands.

## Verified example

The greeting task is already implemented on `main`: English/Spanish greetings, fallback to English for unknown locales, five passing tests, and [API documentation](greeting-api.md). Change `PROMPT.md` to give a future loop another task; when the task is complete, the current prompt asks it to review history and verify the result.

The latest live verification used `igor-makarov/shurik@v1` at release `v1.1.8` with DeepSeek v4.1 Flash and native environment authentication. [Iteration 1](https://github.com/igor-makarov/shurik-demo/actions/runs/38172986386), [iteration 2](https://github.com/igor-makarov/shurik-demo/actions/runs/38173083362), and [iteration 3](https://github.com/igor-makarov/shurik-demo/actions/runs/38173188755) all succeeded and passed the five application tests. Iteration 2 read the first transcript on a fresh runner; iteration 3 searched saved sessions. The [stop run](https://github.com/igor-makarov/shurik-demo/actions/runs/38173242091) succeeded, and the next queued run skipped the stopped loop. The final native journal reopened successfully. Provider-reported cumulative model cost was approximately $0.016.

That earlier verification loop retains its [recorded control branch](https://github.com/igor-makarov/shurik-demo/tree/codex/shurik-control/v118-20261011-2036). New loops use the task branch equal to their ID and `shurik-control/<loop-id>` for control and sessions. The greeting implementation originally came from an [earlier live iteration](https://github.com/igor-makarov/shurik-demo/actions/runs/38138912933) and was published to `main` without a demo PR.

## Where session data lives

All branches and session data belong to this consumer repository:

| Data | Runtime, outside the repository | `shurik-control/<loop-id>` |
| --- | --- | --- |
| Session directory | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/` | `state/` |
| Native Pi Durable journal | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/pi-jsonl/` | `state/pi-jsonl/` |
| Session index | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/history-index.json` | `state/history-index.json` |
| Iteration outcomes | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/iterations/` | `state/iterations/` |
| Diagnostics | `$HOME/.shurik/logs/igor-makarov/shurik-demo/<loop-id>/` | `state/diagnostics/` |
| Emergency snapshot | `$HOME/.shurik/emergency/igor-makarov/shurik-demo/<loop-id>/<run-id>-<attempt>/` | Actions artifact only |
| Authoritative loop control and configuration | Supervisor checkout | `control.json` |
| Actions failure reports | `recovery/` within the runtime logs directory | `failures/<run-id>-<attempt>.json` |

Sessions, diagnostics, and fallback snapshots use separate `state/`, `logs/`, and `emergency/` directories under `$HOME/.shurik`, outside every checkout. No `.shurik/` config file, `.shurik-emergency/` ignore, or blanket `*.log` ignore is required. Start saves its action input settings in `control.json`; iterations reuse that record. `SHURIK_HOME` optionally overrides `$HOME/.shurik`. Each checkpoint atomically pushes task changes and control-branch state, pairing them through `control.json.checkpoint.workCommit`. The next run restores sessions into the runtime `state/` directory and saved `state/diagnostics/` into the runtime `logs/` directory. The agent can discover older transcripts with `list_sessions`, `search_sessions`, and `read_session`.

Sessions and diagnostics in a public repository are public. Use public-safe prompts and keep credentials in Actions secrets. The agent runs on the job runner with its token and model key; execute only trusted tasks and source.

## Local application check

With Node 24 installed:

```sh
npm ci --ignore-scripts
npm run verify
```

For tests alone without installing development tools, use `node --test *.test.ts`. TypeScript and Node types are development dependencies only.

See Shurik's [README](https://github.com/igor-makarov/shurik/blob/v1/README.md) and [architecture](https://github.com/igor-makarov/shurik/blob/v1/ARCHITECTURE.md) for CLI commands, configuration, and persistence details.
