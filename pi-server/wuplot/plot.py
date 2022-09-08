import click
from pygg import *
from wuutils import *
from sqlalchemy import *



@click.command()
@click.argument("dbpath")
def main(dbpath):
  db = create_engine("sqlite:///{}".format(dbpath))

  rows = run_q(db, """
  select tree, mapping,
    min(cost) as mincost, 
    max(cost) as maxcost,
    min(iter) as miniter, max(iter) as maxiter, 
    min(time) as mint, max(time) as maxt,
    count(*) as c
  from iter
  group by tree, mapping
  order by tree, mapping
  """)

  with open("./trees.txt", "w") as f:
    tree = None
    for row in rows:
      if row['tree'] != tree:
        print("\n", file=f)
        print("=" * 50, file=f)
        print(row['tree'], file=f)
        print(file=f)
        tree = row['tree']
        print("TimesSeen   Cost                 Iter", file=f)
      print("{c:3d}        {mincost:5.0f} {maxcost:5.0f}   {miniter:5d} {maxiter:5d}\t{mapping}".format(**row), file=f)


  rows = run_q(db, """
  select tree, 
    cost,
    iter,
    time,
    'best'||(cost = (SELECT max(cost) FROM iter)) as best
  from iter
  """)
  p = ggplot(rows, aes(x="tree", y="iter", color="best"))
  p += geom_point(alpha=0.5, size=2, position=position_jitter(width=0))
  p += geom_violin()
  p += axis_labels("Diff Tree", "MCTS Iteration", "discrete")
  p += coord_flip()
  ggsave("trees_iter.png", p, width=12, height=20)

  p = ggplot(rows, aes(x="tree", y="cost", color="best"))
  p += geom_point(alpha=0.5, size=2, position=position_jitter(width=0))
  p += geom_violin()
  p += axis_labels("Diff Tree", "Cost", "discrete")
  p += coord_flip()
  ggsave("trees_cost.png", p, width=12, height=20)



  tree = run_q(db, """
      SELECT tree from iter 
      where cost = (SELECT max(cost) from iter)
      limit 1 """)[0]['tree']
  print("best tree")
  print(tree)


  rows = run_q(db, """
    select timestamp as t, iter, cost as cost, 
          'p'||proc as proc, tree ,
          'best'||(cost = (SELECT max(cost) FROM iter)) as best
    from iter
  """)

  p = ggplot(rows, aes(x = "iter", y="cost", color="best"))
  p += geom_point(alpha=0.5) #+ geom_line()
  p += facet_grid("proc~.")
  p += legend_bottom
  ggsave("iter_cost.png", p, width=6, height=4)

  rows = run_q(db, """select i2.timestamp - i1.timestamp as t, i2.iter, i2.cost, 'p'||i2.proc  as proc, i2.timestamp as tstamp
  from iter i1, iter i2 where i1.iter+1 = i2.iter and i1.proc = i2.proc""")
  p = ggplot(rows, aes(x = "iter", y="t", group="proc", shape="proc", color="proc"))
  p += geom_point()
  p += facet_grid("proc~.")
  p += legend_bottom
  ggsave("iter_time.png", p, width=6, height=4)

  p = ggplot(rows, aes(x = "tstamp", y="t", group="proc", shape="proc", color="proc"))
  p += geom_point()
  p += facet_grid("proc~.")
  p += legend_bottom
  ggsave("time_time.png", p, width=6, height=4)


if __name__ == "__main__":
    main()
