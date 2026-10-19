# Synthetic demo vacancies

`demo_junior_data_analyst.csv` is an authored software fixture, **not a collection of real vacancies**. Every employer, role listing, location, and description is fictional. It was not downloaded from HeadHunter, scraped, or sampled from the labor market. Blank publication dates and URLs are deliberate: no active hiring or application links are claimed.

Dataset version: `synthetic-da-v1`. The API also returns the file's SHA-256 fingerprint. Editing the bytes invalidates replay of analyses tied to the previous fingerprint; do not silently replace a dataset behind saved results.

There are eight valid fixtures, including one without recognizable skills to exercise the unscorable case. The first N valid unique records are selected in file order; this is not a random or representative sample. Fixtures exercise aliases, description extraction, negation, duplicate mentions, and skill confidence. Repeated descriptions mentioning a skill only count once per vacancy.

Required CSV columns: `external_id,title,description`. Optional columns: `employer,location,published_at,url,experience,structured_skills`. Use `|` between structured skills and standard CSV quoting for commas or multiline text. The provider accepts UTF-8/BOM, at most 1 MiB, scans at most 100 records, and returns at most 50. Invalid optional dates/URLs are omitted with warnings; invalid required fields and duplicate IDs are skipped and counted. CSV parse/encoding failures fail explicitly. The path is server-controlled, never accepted from a request.

Place future private/local datasets under `data/local/` (ignored by Git), and introduce a separately labeled provider. Do not relabel these fixtures as live jobs or real market demand.
