# Jade Parser based on Antlr4

Grammar definition is in `DiffSql.txt`

Run `translate.py DiffSql` to translate `DiffSql.txt` to `DiffSql.g4`

Run `antlr4 -Dlanguage=Python3 DiffSql.g4` to generate Lexer/Parser and dependent files.

`parser.parse(diffsql)` returns an AST tree which can convert to json.