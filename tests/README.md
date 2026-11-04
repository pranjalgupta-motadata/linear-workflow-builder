# Tests

Browser-driven checks that open a build in headless Chrome and use it like a person (hover, click, read what's on screen).

## Setup (once)

```
npm i -D playwright-core
```

Needs Google Chrome installed. Point at a different Chrome with `CHROME="C:/path/to/chrome.exe"`.

## Trigger rule — `trigger-rule.test.cjs`

Proves the sentence-view trigger rule (approved 2026-09-23): one record per rule; "+ add trigger" never asks the event or the record again, it lists that record's own fields, greys out fields already watched, and a pick adds an OR line.

| Case | What it checks |
|---|---|
| 1 | Updated → Change → priority, then "+ add trigger": title "Add trigger", source card "Record · Change", only Change fields, "priority" greyed, picking "status" adds a second line on the same record |
| 2 | Created → Request, then "+ add trigger": Request fields, nothing greyed, picking "impact" adds the line |
| 3 | Empty rule: "+ add trigger" opens the normal first-trigger menu (events, no source card) |
| 4 | Event picked but no record yet: "+ add trigger" is disabled |
| 5 | Schedule trigger: "+ add trigger" is disabled |

```
node tests/trigger-rule.test.cjs                    # tests index.html (the live page)
node tests/trigger-rule.test.cjs index-v5.17.html   # tests another build
```

Exit code 0 = all passed. Screenshots land in `tests/out/` (not committed).
