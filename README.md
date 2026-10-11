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
2. Enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**.
3. Read or change [PROMPT.md](PROMPT.md). It asks Shurik to add Spanish greetings with tests and API documentation.
4. In **Actions → Shurik → Run workflow**, use `main`, command `start`, a unique loop ID such as `greeting-demo`, and an explicit reasoning level such as `high`. Leave model and seconds blank to use [.shurik/config.json](.shurik/config.json), which selects `space-bunny-free` and a two-minute iteration budget. Supply a deadline a few minutes in the future to bound the demo.
5. Review task changes in the draft PR from `codex/shurik/greeting-demo`. Shurik does not merge it.
6. Use **Shurik → stop** with that loop ID. Resume requires a new explicit reasoning level. The recovery job runs in this same workflow after iteration failure; its schedule also checks every 15 minutes if the entire workflow was interrupted.

A model finishing the greeting task ends one iteration; the outer loop continues until its deadline or a stop. No agent loop starts just from cloning or pushing this repository. Demo CI runs `node --test` without model credentials.

## Where session data lives

All branches and session data belong to this consumer repository:

| Data | Runtime, outside the repository | `codex/shurik-control/<loop-id>` |
| --- | --- | --- |
| Session directory | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/` | `state/` |
| Native Pi Durable journal | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/pi-jsonl/` | `state/pi-jsonl/` |
| Session index | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/history-index.json` | `state/history-index.json` |
| Iteration outcomes | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/iterations/` | `state/iterations/` |
| Diagnostics | `$HOME/.shurik/state/igor-makarov/shurik-demo/<loop-id>/diagnostics/` | `state/diagnostics/` |
| Authoritative loop control | Supervisor checkout | `control.json` |
| Actions failure reports | `diagnostics/recovery/` within session directory | `failures/<run-id>-<attempt>.json` |

The session directory is outside every checkout and cannot enter task commits. `SHURIK_HOME` optionally overrides `$HOME/.shurik`. Each checkpoint atomically pushes task changes and control-branch state, pairing them through `control.json.checkpoint.workCommit`. The next run restores `state/` into the canonical runtime location. The agent can discover older transcripts with `list_sessions`, `search_sessions`, and `read_session`.

Sessions and diagnostics in a public repository are public. Use public-safe prompts and keep credentials in Actions secrets. The agent runs on the job runner with its token and model key; execute only trusted tasks and source.

## Local application check

With Node 24 installed:

```sh
node --test
```

See Shurik's [README](https://github.com/igor-makarov/shurik/blob/v1/README.md) and [architecture](https://github.com/igor-makarov/shurik/blob/v1/ARCHITECTURE.md) for CLI commands, configuration, and persistence details.
