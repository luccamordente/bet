# Architecture

ETL cascade.

[Main ETL](#main-etl):

1. Extract ([Scraping ETL](#scraping-etl)):
   1. Extract: chain of multiple ETL processes
   2. Transform
   3. Load
2. Transform
3. Load

## Main ETL

### 1. Extract

Get data from [Scraping ETL](#scraping-etl).

### 2. Transform

Transform structured data into comparable format.

### 3. Load

Save comparable data to database.

## Scraping ETL

Series of ETL processes for each entity in the website.

1. Extract: Read website
2. Transform: Turn into a structured format
3. Load: Emit to whoever is interested

### 1. Extract

Get data in HTML format from website.

If something doesn't conform with the expected HTML pattern, report back for analysis. (In the future, we can gather this in an bug tracking system)

Data extraction is synchronous.

**Entities**

- Sport
- League
- Match
- Market Tab
- Market Group

**Flow**

Contains mini ETL processes.

1. 🕷 Load sport:
   1. 📂 Receives main page and sport name;
   2. 📂 Find and open sport page;
   3. 🔪 Get data:
      1. E: Extract all league names;
      2. T: Transform and filter;
      3. L: Return data;
   4. 🕷 Recruit spiders for passed along data;
   5. 📂 Go back to received page
2. 🕷 Load league:
   1. 📂 Receives sport page and league name;
   2. 📂 Find and open league collapsible;
   3. 🔪 Get data:
      1. E: Extract all match names;
      2. T: Transform and filter;
      3. L: Return data;
   4. 🕷 Recruit spiders for passed along data;
   5. 📂 Go back to received page
3. 🕷 Load match:
   1. 📂 Receives league page and match name;
   2. 📂 Find and open math page;
   3. 🔪 Get data:
      1. E: Extract all market tab names;
      2. T: Transform and filter;
      3. L: Return data;
   4. 🕷 Recruit spiders for passed along data;
   5. 📂 Go back to received page
4. 🕷 Load market tab:
   1. 📂 Receives match page and tab name;
   2. 📂 Find and open market tab;
   3. 🔪 Get data:
      1. E: Extract all market group names;
      2. T: Transform and filter;
      3. L: Return data;
   4. 🕷 Recruit spiders for passed along data;
   5. 📂 Go back to received page
5. 🕷 Load market group:
   1. 📂 Receives market tab page and market group name;
   2. 📂 Find and open market group collapsible;
   3. 🔪 Get data:
      1. E: Extract HTML for market group;
      2. T: Transform and filter;
      3. L: Return data;
   4. 🕷 Recruit spiders for passed along data;
   5. 📂 Go back to received page

**Controls**

- 🕷 **Spider**: one for each entity
  - receives a page
  - find information
  - recruit a group of spiders to deal with it
  - go back to origin
- 📂 **Opener**: maybe a generic one that's entity agnostic
  - receives a page and a selector
  - opens that thing in the page (a new page or an element)
  - return the page or element
  - waits
  - goes back to original page
- 🔪 **Extractor**: one for each entity
  - receives an element handler
  - extract the data in that element

Filters for each spider extractor will decide whether or not to move to the next phase.

Existing filters are:

- Match start time

### 2. Transform

Turn the scraped HTML data for each Market Group into a structured JSON format.

### 3. Load

Emit the structured JSON data to whoever is interested in working with it. In our case, the [Main ETL](#main-etl).

# Good to know

- Desktop website is lighter (1.8 MB) and loads faster than mobile (2.0 MB)

# Potential issues

-
