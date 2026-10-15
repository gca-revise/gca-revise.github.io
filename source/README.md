# Source texts

- `macbeth.txt`: the full text of Macbeth from the Folger Shakespeare Library (https://shakespeare.folger.edu/), converted from the Folger PDF. Used as the reference to check quotes, speakers and scene numbers in `quotes.csv`. Scene numbers follow the Folger edition. The `folger_ftln` column in `quotes.csv` is the line marker (FTLN) where each quote starts, so it can be found with a text search.

- `jekyll-hyde.txt`: the full text of The Strange Case of Dr Jekyll and Mr Hyde from Project Gutenberg (https://www.gutenberg.org/ebooks/43), converted from the Gutenberg HTML file. Public domain. Used to check chapters, speakers and wording in `quotes.csv`. Chapter 6's heading is “Remarkable Incident of Dr. Lanyon” (it appears around character 52,400).

- `frankenstein.txt`: the full text of Frankenstein from Project Gutenberg (ebook 84, https://www.gutenberg.org/ebooks/84), converted from the Gutenberg HTML file. Public domain. Used to check chapters, speakers and wording in `quotes.csv`. Gutenberg 84 is the 1818 text (Letters 1-4 and Chapters 1-24 in three volumes); if the school reads the 1831 edition, some wording and chapter numbers will differ.
