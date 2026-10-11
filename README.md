# shurik-demo

A small consumer project using [Shurik](https://github.com/igor-makarov/shurik) through a GitHub Action. The application has no dependencies and does not contain Shurik's engine source.

One workflow handles start, stop, resume, iterations and recovery. The integration in [.github/workflows/shurik.yml](.github/workflows/shurik.yml) is:

```yaml
- uses: igor-makarov/shurik@v1
  with:
    inputs: ${{ toJSON(inputs) }}
    workflow: shurik.yml
    opencode-api-key: ${{ secrets.OPENCODE_API_KEY }}
```

Each run uses the current `v1` release. Use `@v2` when you choose to adopt a future major version. Shurik's CLI handles the loop and Pi Durable handles native session history.

## Try it

1. Add the repository Actions secret `OPENCODE_API_KEY`.
2. Optionally enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests** for draft PRs. The `create_pr` workflow input defaults to `auto`, creating a PR when allowed and continuing on the task branch otherwise. Choose `false` to skip PR creation, or `true` to enable it explicitly. The action input is `create-pr`; the CLI flag is `--create-pr`.
3. Read or change [PROMPT.md](PROMPT.md). It asks Shurik to add Spanish greetings with tests and API documentation.
4. In **Actions → Shurik → Run workflow**, use `main`, command `start`, a unique loop ID such as `greeting-demo`, and an explicit reasoning level such as `high`. Leave model and seconds blank to use the workflow's action inputs, which select `deepseek-v4.1-flash` and a two-minute iteration time limit with checkpoints every 60 seconds. This is a paid model; the original `space-bunny-free` model was unavailable during verification. Supply a deadline a few minutes in the future to bound the demo. The time limit and deadline are not spending caps.
5. Review task changes on `codex/shurik/greeting-demo`, or in its draft PR when enabled. Shurik does not merge it.
6. Use **Shurik → stop** with that loop ID. Resume requires a new explicit reasoning level. The recovery job runs in this same workflow after iteration failure; its schedule also checks every 15 minutes if the entire workflow was interrupted.

A model finishing the greeting task ends one iteration; the outer loop continues until its deadline or a stop. No agent loop starts just from cloning or pushing this repository. Demo CI runs `node --test` without model credentials.

## Verified example

The greeting task is already implemented on `main`: English/Spanish greetings, fallback to English for unknown locales, five passing tests, and [API documentation](greeting-api.md). Change `PROMPT.md` to give a future loop another task; when the task is complete, the current prompt asks it to review history and verify the result.

The live loop `greeting-20261011-120943-retry` used `igor-makarov/shurik@v1` and DeepSeek v4.1 Flash. [Iteration 2-5](https://github.com/igor-makarov/shurik-demo/actions/runs/38138912933) implemented the task and checkpointed it. [Iteration 2-6](https://github.com/igor-makarov/shurik-demo/actions/runs/38138996521) restored the journal on a fresh runner and read the prior session. Both iteration jobs then encountered GitHub's disabled PR-creation setting; their recovery jobs in the same workflow succeeded and continued the loop. Current Shurik treats that optional setting as nonfatal and remembers it as `createPr: false`.

The verified task changes were published directly to `main`; no demo PR was created. The [stop run](https://github.com/igor-makarov/shurik-demo/actions/runs/38139089855) succeeded, and the [control branch](https://github.com/igor-makarov/shurik-demo/tree/codex/shurik-control/greeting-20261011-120943-retry) records `status: stopped` with no owner. The final journal opens successfully with Shurik's CLI inspector. Provider-reported cumulative model cost for the two paid iterations was approximately $0.011.

## Where session data lives

All branches and session data belong to this consumer repository:

| Data | Runtime, outside the repository | `codex/shurik-control/<loop-id>` |
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
node --test
```

See Shurik's [README](https://github.com/igor-makarov/shurik/blob/v1/README.md) and [architecture](https://github.com/igor-makarov/shurik/blob/v1/ARCHITECTURE.md) for CLI commands, configuration, and persistence details.
