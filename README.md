# MTG Trend price collector

Fetches the official Card Kingdom v2 price list and sends authenticated chunks to the MTG Trend import endpoint. The site application and database remain in a separate private project.

Runs daily at 00:00 UTC (09:00 Japan time). Snapshot dates use UTC; the actual observation timestamp is sent separately to the receiving service. GitHub scheduled runs can be delayed. Manual runs are available through Actions. This project does not implement hourly updates.

## Configuration

Set the repository Actions secret `MTGTREND_IMPORT_TOKEN` to the receiving Worker's import credential. Never commit credentials. Node.js 22 is required; no package installation is needed.

Completed dates are skipped. Partial imports are resumed using chunk identifiers. Successful daily imports remain immutable. Logs contain progress and counts, not raw price lists or credentials.

## Data and rights

No production price archive, partner agreement, email correspondence, database identifier or authentication value is included. The collector does not grant rights to Card Kingdom data or Wizards of the Coast intellectual property. Anyone using it must arrange their own applicable permissions and receiving service.

The receiving service stores changed prices, stock and condition offers only, and reconstructs unchanged observed days for charts. Daily product membership preserves removals. Completion logs report observed products and changed snapshots; no raw feed is published.
