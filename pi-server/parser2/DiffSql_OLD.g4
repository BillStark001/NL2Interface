grammar DiffSql;

root :
    query EOF
;
single_select_cores :
    ( 'Any' '{' single_select_cores ( ',' single_select_cores ) * ';' 'default' '=' select_cores '}' )
    | ( select_cores )
;
opt_orderby :
    ( 'Any' '{' opt_orderby ( ',' opt_orderby ) * ';' 'default' '=' orderby '}' )
    | ( 'Opt' '{' opt_orderby ';' 'default' '=' orderby '}' )
    | ( orderby ? )
;
opt_limit :
    ( 'Any' '{' opt_limit ( ',' opt_limit ) * ';' 'default' '=' limit '}' )
    | ( 'Opt' '{' opt_limit ';' 'default' '=' limit '}' )
    | ( limit ? )
;
query :
    single_select_cores opt_orderby opt_limit
;
compound_op_multi_select_core_compound_op :
    compound_op multi_select_core_compound_op
;
single_select_core :
    ( 'Any' '{' single_select_core ( ',' single_select_core ) * ';' 'default' '=' select_core '}' )
    | ( select_core )
;
opt_compound_op_multi_select_core_compound_op :
    ( 'Any' '{' opt_compound_op_multi_select_core_compound_op ( ',' opt_compound_op_multi_select_core_compound_op ) * ';' 'default' '=' compound_op_multi_select_core_compound_op '}' )
    | ( 'Opt' '{' opt_compound_op_multi_select_core_compound_op ';' 'default' '=' compound_op_multi_select_core_compound_op '}' )
    | ( compound_op_multi_select_core_compound_op ? )
;
multi_select_core_compound_op :
    ( 'Subset' '{' compound_op ',' single_select_core ( ',' single_select_core ) * '}' opt_compound_op_multi_select_core_compound_op )
    | ( 'Multi' '{' compound_op ',' single_select_core '}' opt_compound_op_multi_select_core_compound_op )
    | ( single_select_core opt_compound_op_multi_select_core_compound_op )
;
select_cores :
    multi_select_core_compound_op
;
single_select_clause :
    ( 'Any' '{' single_select_clause ( ',' single_select_clause ) * ';' 'default' '=' select_clause '}' )
    | ( select_clause )
;
opt_from_clause :
    ( 'Any' '{' opt_from_clause ( ',' opt_from_clause ) * ';' 'default' '=' from_clause '}' )
    | ( 'Opt' '{' opt_from_clause ';' 'default' '=' from_clause '}' )
    | ( from_clause ? )
;
opt_where_clause :
    ( 'Any' '{' opt_where_clause ( ',' opt_where_clause ) * ';' 'default' '=' where_clause '}' )
    | ( 'Opt' '{' opt_where_clause ';' 'default' '=' where_clause '}' )
    | ( where_clause ? )
;
opt_gb_clause :
    ( 'Any' '{' opt_gb_clause ( ',' opt_gb_clause ) * ';' 'default' '=' gb_clause '}' )
    | ( 'Opt' '{' opt_gb_clause ';' 'default' '=' gb_clause '}' )
    | ( gb_clause ? )
;
select_core :
    single_select_clause opt_from_clause opt_where_clause opt_gb_clause
;
opt_top_or_distinct :
    ( 'Any' '{' opt_top_or_distinct ( ',' opt_top_or_distinct ) * ';' 'default' '=' top_or_distinct'}' )
    | ( 'Opt' '{' opt_top_or_distinct ';' 'default' '=' top_or_distinct '}' )
    | ( top_or_distinct ? )
;
single_select_results :
    ( 'Any' '{' single_select_results ( ',' single_select_results ) * ';' 'default' '=' select_results' }' )
    | ( select_results )
;
select_clause :
    SELECT opt_top_or_distinct single_select_results
;
single_top_clause :
    ( 'Any' '{' single_top_clause ( ',' single_top_clause ) * ';' 'default' '=' '}' )
    | ( top_clause )
;
top_or_distinct :
    single_top_clause
    | distinct
;
single_number :
    ( 'Any' '{' single_number ( ',' single_number ) * ';' 'default' '=' number '}' )
    | ( number )
;
top_clause :
    TOP single_number
;
comma_multi_select_result_comma :
    comma multi_select_result_comma
;
single_select_result :
    ( 'Any' '{' single_select_result ( ',' single_select_result ) * ';' 'default' '=' select_result '}' )
    | ( select_result )
;
opt_comma_multi_select_result_comma :
    ( 'Any' '{' opt_comma_multi_select_result_comma ( ',' opt_comma_multi_select_result_comma ) * ';' 'default' '=' comma_multi_select_result_comma '}' )
    | ( 'Opt' '{' opt_comma_multi_select_result_comma ';' 'default' '=' comma_multi_select_result_comma '}' )
    | ( comma_multi_select_result_comma ? )
;
multi_select_result_comma :
    ( 'Subset' '{' comma ',' single_select_result ( ',' single_select_result ) * '}' opt_comma_multi_select_result_comma )
    | ( 'Multi' '{' comma ',' single_select_result '}' opt_comma_multi_select_result_comma )
    | ( single_select_result opt_comma_multi_select_result_comma )
;
select_results :
    multi_select_result_comma
;
single_sel_res_all_star :
    ( 'Any' '{' single_sel_res_all_star ( ',' single_sel_res_all_star ) * ';' 'default' '=' sel_res_all_star '}' )
    | ( sel_res_all_star )
;
single_sel_res_tab_star :
    ( 'Any' '{' single_sel_res_tab_star ( ',' single_sel_res_tab_star ) * ';' 'default' '=' sel_res_tab_star '}' )
    | ( sel_res_tab_star )
;
single_sel_res_val :
    ( 'Any' '{' single_sel_res_val ( ',' single_sel_res_val ) * ';' 'default' '=' sel_res_val '}' )
    | ( sel_res_val )
;
single_sel_res_col :
    ( 'Any' '{' single_sel_res_col ( ',' single_sel_res_col ) * ';' 'default' '=' sel_res_col '}' )
    | ( sel_res_col )
;
select_result :
    single_sel_res_all_star
    | single_sel_res_tab_star
    | single_sel_res_val
    | single_sel_res_col
;
single_name :
    ( 'Any' '{' single_name ( ',' single_name ) * ';' 'default' '=' name '}' )
    | ( name )
;
sel_res_tab_star :
    single_name '.*'
;
sel_res_all_star :
    STAR
;
as_name :
    AS name
;
single_expr :
    ( 'Any' '{' single_expr ( ',' single_expr ) * ';' 'default' '=' expr '}' )
    | ( expr )
;
opt_as_name :
    ( 'Any' '{' opt_as_name ( ',' opt_as_name ) * ';' 'default' '=' as_name '}' )
    | ( 'Opt' '{' opt_as_name ';' 'default' '=' as_name '}' )
    | ( as_name ? )
;
sel_res_val :
    single_expr opt_as_name
;
single_col_ref :
    ( 'Any' '{' single_col_ref ( ',' single_col_ref ) * ';' 'default' '=' col_ref '}' )
    | ( col_ref )
;
sel_res_col :
    single_col_ref opt_as_name
;
comma_multi_single_source_comma :
    comma multi_single_source_comma
;
single_single_source :
    ( 'Any' '{' single_single_source ( ',' single_single_source ) * ';' 'default' '=' single_source '}' )
    | ( single_source )
;
opt_comma_multi_single_source_comma :
    ( 'Any' '{' opt_comma_multi_single_source_comma ( ',' opt_comma_multi_single_source_comma ) * ';' 'default' '=' comma_multi_single_source_comma '}' )
    | ( 'Opt' '{' opt_comma_multi_single_source_comma ';' 'default' '=' comma_multi_single_source_comma '}' )
    | ( comma_multi_single_source_comma ? )
;
multi_single_source_comma :
    ( 'Subset' '{' comma ',' single_single_source ( ',' single_single_source ) * '}' opt_comma_multi_single_source_comma )
    | ( 'Multi' '{' comma ',' single_single_source '}' opt_comma_multi_single_source_comma )
    | ( single_single_source opt_comma_multi_single_source_comma )
;
from_list :
    multi_single_source_comma
;
single_join :
    single_single_source ON expr
;
join_multi_single_join_join :
    join multi_single_join_join
;
single_single_join :
    ( 'Any' '{' single_single_join ( ',' single_single_join ) * ';' 'default' '=' single_join '}' )
    | ( single_join )
;
opt_join_multi_single_join_join :
    ( 'Any' '{' opt_join_multi_single_join_join ( ',' opt_join_multi_single_join_join ) * ';' 'default' '=' join_multi_single_join_join '}' )
    | ( 'Opt' '{' opt_join_multi_single_join_join ';' 'default' '=' join_multi_single_join_join '}' )
    | ( join_multi_single_join_join ? )
;
multi_single_join_join :
    ( 'Subset' '{' join ',' single_single_join ( ',' single_single_join ) * '}' opt_join_multi_single_join_join )
    | ( 'Multi' '{' join ',' single_single_join '}' opt_join_multi_single_join_join )
    | ( single_single_join opt_join_multi_single_join_join )
;
join_clause :
    JOIN multi_single_join_join
;
opt_join_clause :
    ( 'Any' '{' opt_join_clause ( ',' opt_join_clause ) * ';' 'default' '=' join_clause '}' )
    | ( 'Opt' '{' opt_join_clause ';' 'default' '=' join_clause '}' )
    | ( join_clause ? )
;
join_source :
    single_single_source opt_join_clause
;
from_source :
    from_list
    | join_source
;
single_from_source :
    ( 'Any' '{' single_from_source ( ',' single_from_source ) * ';' 'default' '=' from_source '}' )
    | ( from_source )
;
from_clause :
    FROM single_from_source
;
single_source_func :
    ( 'Any' '{' single_source_func ( ',' single_source_func ) * ';' 'default' '=' source_func '}' )
    | ( source_func )
;
single_source_table :
    ( 'Any' '{' single_source_table ( ',' single_source_table ) * ';' 'default' '=' source_table '}' )
    | ( source_table )
;
single_source_subq :
    ( 'Any' '{' single_source_subq ( ',' single_source_subq ) * ';' 'default' '=' source_subq '}' )
    | ( source_subq )
;
single_source :
    ( single_source_func
    | single_source_table
    | single_source_subq ) opt_as_name
;
source_table :
    single_name
;
single_query :
    ( 'Any' '{' single_query ( ',' single_query ) * ';' 'default' '=' query '}' )
    | ( query )
;
source_subq :
    '(' single_query ')'
;
single_function :
    ( 'Any' '{' single_function ( ',' single_function ) *  ';' 'default' '=' function '}' )
    | ( function )
;
source_func :
    single_function
;
and_or :
    and
    | or
;
and_or_multi_expr_and_or :
    and_or multi_expr_and_or
;
opt_and_or_multi_expr_and_or :
    ( 'Any' '{' opt_and_or_multi_expr_and_or ( ',' opt_and_or_multi_expr_and_or ) * ';' 'default' '=' and_or_multi_expr_and_or '}' )
    | ( 'Opt' '{' opt_and_or_multi_expr_and_or ';' 'default' '=' and_or_multi_expr_and_or '}' )
    | ( and_or_multi_expr_and_or ? )
;
multi_expr_and_or :
    ( 'Subset' '{' and_or ',' single_expr ( ',' single_expr ) * '}' opt_and_or_multi_expr_and_or )
    | ( 'Multi' '{' and_or ',' single_expr '}' opt_and_or_multi_expr_and_or )
    | ( single_expr opt_and_or_multi_expr_and_or )
;
where_clause :
    WHERE multi_expr_and_or
;
single_group_clause :
    ( 'Any' '{' single_group_clause ( ',' single_group_clause ) * ';' 'default' '=' group_clause '}' )
    | ( group_clause )
;
opt_having_clause :
    ( 'Any' '{' opt_having_clause ( ',' opt_having_clause ) * ';' 'default' '=' having_clause '}' )
    | ( 'Opt' '{' opt_having_clause ';' 'default' '=' having_clauase '}' )
    | ( having_clause ? )
;
gb_clause :
    GROUP BY single_group_clause opt_having_clause
;
comma_multi_grouping_term_comma :
    comma multi_grouping_term_comma
;
single_grouping_term :
    ( 'Any' '{' single_grouping_term ( ',' single_grouping_term ) * ';' 'default' '=' grouping_term '}' )
    | ( grouping_term )
;
opt_comma_multi_grouping_term_comma :
    ( 'Any' '{' opt_comma_multi_grouping_term_comma ( ',' opt_comma_multi_grouping_term_comma ) * ';' 'default' '=' comma_multi_grouping_term_comma'}' )
    | ( 'Opt' '{' opt_comma_multi_grouping_term_comma ';' 'default' '=' comma_multi_grouping_term_comma '}' )
    | ( comma_multi_grouping_term_comma ? )
;
multi_grouping_term_comma :
    ( 'Subset' '{' comma ',' single_grouping_term ( ',' single_grouping_term ) * '}' opt_comma_multi_grouping_term_comma )
    | ( 'Multi' '{' comma ',' single_grouping_term '}' opt_comma_multi_grouping_term_comma )
    | ( single_grouping_term opt_comma_multi_grouping_term_comma )
;
group_clause :
    multi_grouping_term_comma
;
grouping_term :
    single_expr
;
and_multi_expr_and :
    and multi_expr_and
;
opt_and_multi_expr_and :
    ( 'Any' '{' opt_and_multi_expr_and ( ',' opt_and_multi_expr_and ) * ';' 'default' '=' and_multi_expr_and '}' )
    | ( 'Opt' '{' opt_and_multi_expr_and ';' 'default' '=' compound_op_multi_select_core_compound_op '}' )
    | ( and_multi_expr_and ? )
;
multi_expr_and :
    ( 'Subset' '{' and ',' single_expr ( ',' single_expr ) * '}' opt_and_multi_expr_and )
    | ( 'Multi' '{' and ',' single_expr '}' opt_and_multi_expr_and )
    | ( single_expr opt_and_multi_expr_and )
;
having_clause :
    HAVING multi_expr_and
;
comma_multi_ordering_term_comma :
    comma multi_ordering_term_comma
;
single_ordering_term :
    ( 'Any' '{' single_ordering_term ( ',' single_ordering_term ) * ';' 'default' '=' ordering_term '}' )
    | ( ordering_term )
;
opt_comma_multi_ordering_term_comma :
    ( 'Any' '{' opt_comma_multi_ordering_term_comma ( ',' opt_comma_multi_ordering_term_comma ) * ';' 'default' '=' comma_multi_ordering_term_comma '}' )
    | ( 'Opt' '{' opt_comma_multi_ordering_term_comma ';' 'default' '=' comma_multi_ordering_term_comma '}' )
    | ( comma_multi_ordering_term_comma ? )
;
multi_ordering_term_comma :
    ( 'Subset' '{' comma ',' single_ordering_term ( ',' single_ordering_term ) * '}' opt_comma_multi_ordering_term_comma )
    | ( 'Multi' '{' comma ',' single_ordering_term '}' opt_comma_multi_ordering_term_comma )
    | ( single_ordering_term opt_comma_multi_ordering_term_comma )
;
orderby :
    ORDER BY multi_ordering_term_comma
;
asc_desc :
    ASC|DESC
;
opt_asc_desc :
    ( 'Any' '{' opt_asc_desc ( ',' opt_asc_desc ) * ';' 'default' '=' asc_desc '}' )
    | ( 'Opt' '{' opt_asc_desc ';' 'default' '=' asc_desc '}' )
    | ( asc_desc ? )
;
ordering_term :
    single_expr opt_asc_desc
;
limit :
    LIMIT single_expr
;
table_dot :
    name '.'
;
opt_table_dot :
    ( 'Any' '{' opt_table_dot ( ',' opt_table_dot ) * ';' 'default' '=' table_dot '}' )
    | ( 'Opt' '{' opt_table_dot ';' 'default' '=' table_dot '}' )
    | ( table_dot ? )
;
col_ref :
    opt_table_dot single_name
;
single_btwnexpr :
    ( 'Any' '{' single_btwnexpr ( ',' single_btwnexpr ) * ';' 'default' '=' btwnexpr '}' )
    | ( btwnexpr )
;
single_biexpr :
    ( 'Any' '{' single_biexpr ( ',' single_biexpr ) * ';' 'default' '=' biexpr '}' )
    | ( biexpr )
;
single_unexpr :
    ( 'Any' '{' single_unexpr ( ',' single_unexpr ) * ';' 'default' '=' unexpr '}' )
    | ( unexpr )
;
single_value :
    ( 'Any' '{' single_value ( ',' single_value ) * ';' 'default' '=' value '}' )
    | ( value )
;
expr :
    single_btwnexpr
    | single_biexpr
    | single_unexpr
    | single_value
    | single_source_subq
;
btwnexpr :
    single_value BETWEEN single_value AND single_value
;
single_binaryop_no_andor :
    ( 'Any' '{' single_binaryop_no_andor ( ',' single_binaryop_no_andor ) * ';' 'default' '=' binaryop_no_andor '}' )
    | ( binaryop_no_andor )
;
biexpr :
    single_value single_binaryop_no_andor single_expr
;
single_unaryop :
    ( 'Any' '{' single_unaryop ( ',' single_unaryop ) * ';' 'default' '=' unaryop '}' )
    | ( unaryop )
;
unexpr :
    single_unaryop single_expr
;
single_parenval :
    ( 'Any' '{' single_parenval ( ',' single_parenval ) * ';' 'default' '=' parenval '}' )
    | ( parenval )
;
single_boolean :
    ( 'Any' '{' single_boolean ( ',' single_boolean ) * ';' 'default' '=' boolean '}' )
    | ( boolean )
;
single_string :
    ( 'Any' '{' single_string ( ',' single_string ) * ';' 'default' '=' string '}' )
    | ( string )
;
value :
    single_parenval
    | single_number
    | single_boolean
    | single_function
    | single_col_ref
    | single_string
    | single_name
;
parenval :
    '(' single_expr ')'
;
opt_arg_list :
    ( 'Any' '{' opt_arg_list ( ',' opt_arg_list ) * ';' 'default' '=' arg_list '}' )
    | ( 'Opt' '{' opt_arg_list ';' 'default' '=' arg_list '}' )
    | ( arg_list ? )
;
function :
    single_name '(' opt_arg_list ')'
;
comma_multi_expr_comma :
    comma multi_expr_comma
;
opt_comma_multi_expr_comma :
    ( 'Any' '{' opt_comma_multi_expr_comma ( ',' opt_comma_multi_expr_comma ) * ';' 'default' '=' comma_multi_expr_comma '}' )
    | ( 'Opt' '{' opt_comma_multi_expr_comma ';' 'default' '=' comma_multi_expr_comma '}' )
    | ( comma_multi_expr_comma ? )
;
multi_expr_comma :
    ( 'Subset' '{' comma ',' single_expr ( ',' single_expr ) * '}' opt_comma_multi_expr_comma )
    | ( 'Multi' '{' comma ',' single_expr '}' opt_comma_multi_expr_comma )
    | ( single_expr opt_comma_multi_expr_comma )
;
arg_list :
    multi_expr_comma
;
boolean :
    'true'
    | 'false'
;
compound_op :
    'UNION'
    | 'union'
;
binaryop :
    '+'
    | '-'
    | STAR
    | '/'
    | '=='
    | '='
    | '<>'
    | '!='
    | '<='
    | '>='
    | '<'
    | '>'
    | 'like'
    | 'LIKE'
    | and_or
;
binaryop_no_andor :
    '+'
    | '-'
    | STAR
    | '/'
    | '=='
    | '='
    | '<>'
    | '!='
    | '<='
    | '>='
    | '<'
    | '>'
    | 'like'
    | 'LIKE'
;
unaryop :
    '+'
    | '-'
    | 'not'
    | 'NOT'
;
string :
    STRING
;
name :
    NAME
;
number :
    NUMBER
;
comma :
    COMMA
;
and :
    AND
;
or :
    OR
;
join :
    JOIN
;
distinct :
    DISTINCT
;
STAR :
    '*'
;
ADD :
    ('ADD'
    | 'add')
;
ALL :
    ('ALL'
    | 'all')
;
ALTER :
    ('ALTER'
    | 'alter')
;
AND :
    ('AND'
    | 'and')
;
AS :
    ('AS'
    | 'as')
;
ASC :
    ('ASC'
    | 'asc')
;
BETWEEN :
    ('BETWEEN'
    | 'between')
;
BY :
    ('BY'
    | 'by')
;
CAST :
    ('CAST'
    | 'cast')
;
COLUMN :
    ('COLUMN'
    | 'column')
;
DESC :
    ('DESC'
    | 'desc')
;
DISTINCT :
    ('DISTINCT'
    | 'distinct')
;
TOP :
    ('TOP'
    | 'top')
;
E :
    'E'
;
COMMA :
    ','
;
ESCAPE :
    ('ESCAPE'
    | 'escape')
;
EXCEPT :
    ('EXCEPT'
    | 'except')
;
EXISTS :
    ('EXISTS'
    | 'exists')
;
EXPLAIN :
    ('EXPLAIN'
    | 'explain')
;
EVENT :
    ('EVENT'
    | 'event')
;
FORALL :
    ('FORALL'
    | 'forall')
;
FROM :
    ('FROM'
    | 'from')
;
GLOB :
    ('GLOB'
    | 'glob')
;
GROUP :
    ('GROUP'
    | 'group')
;
HAVING :
    ('HAVING'
    | 'having')
;
IN :
    ('IN'
    | 'in')
;
INNER :
    ('INNER'
    | 'inner')
;
INSERT :
    ('INSERT'
    | 'insert')
;
INTERSECT :
    ('INTERSECT'
    | 'intersect')
;
INTO :
    ('INTO'
    | 'into')
;
IS :
    ('IS'
    | 'is')
;
ISNULL :
    ('ISNULL'
    | 'isnull')
;
JOIN :
    ('JOIN'
    | 'join')
;
KEY :
    ('KEY'
    | 'key')
;
LEFT :
    ('LEFT'
    | 'left')
;
LIKE :
    ('LIKE'
    | 'like')
;
LIMIT :
    ('LIMIT'
    | 'limit')
;
MATCH :
    ('MATCH'
    | 'match')
;
NO :
    ('NO'
    | 'no')
;
NOT :
    ('NOT'
    | 'not')
;
NOTNULL :
    ('NOTNULL'
    | 'notnull')
;
NULL :
    ('NULL'
    | 'null')
;
OF :
    ('OF'
    | 'of')
;
OFFSET :
    ('OFFSET'
    | 'offset')
;
ON :
    ('ON'
    | 'on')
;
OR :
    ('OR'
    | 'or')
;
ORDER :
    ('ORDER'
    | 'order')
;
OUTER :
    ('OUTER'
    | 'outer')
;
PRIMARY :
    ('PRIMARY'
    | 'primary')
;
QUERY :
    ('QUERY'
    | 'query')
;
RAISE :
    ('RAISE'
    | 'raise')
;
REFERENCES :
    ('REFERENCES'
    | 'references')
;
REGEXP :
    ('REGEXP'
    | 'regexp')
;
RENAME :
    ('RENAME'
    | 'rename')
;
REPLACE :
    ('REPLACE'
    | 'replace')
;
RETURN :
    ('RETURN'
    | 'return')
;
ROW :
    ('ROW'
    | 'row')
;
SAVEPOINT :
    ('SAVEPOINT'
    | 'savepoint')
;
SELECT :
    ('SELECT'
    | 'select')
;
SET :
    ('SET'
    | 'set')
;
TABLE :
    ('TABLE'
    | 'table')
;
TEMP :
    ('TEMP'
    | 'temp')
;
TEMPORARY :
    ('TEMPORARY'
    | 'temporary')
;
THEN :
    ('THEN'
    | 'then')
;
TO :
    ('TO'
    | 'to')
;
UNION :
    ('UNION'
    | 'union')
;
USING :
    ('USING'
    | 'using')
;
VALUES :
    ('VALUES'
    | 'values')
;
VIRTUAL :
    ('VIRTUAL'
    | 'virtual')
;
WITH :
    ('WITH'
    | 'with')
;
WHERE :
    ('WHERE'
    | 'where')
;
NUMBER :
    [0-9]* '.'? [0-9]+
;
STRING :
    '\'' ( ~'\''
    | '\'\'')* '\''
;
NAME :
    [_a-zA-Z][_a-zA-Z0-9]*
;
WS :
    [ \t\r\n]+ -> skip
;
