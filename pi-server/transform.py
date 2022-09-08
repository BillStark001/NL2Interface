from random import randint
from rules import rule_list


def random_apply_rules(root, max_time):

    candidates = []

    def test_rules(node):
        nonlocal candidates
        for c in node.children:
            test_rules(c)
        for r in rule_list:
            if r.test(node):
                candidates.append((r, node))

    for i in range(max_time):
        candidates = []
        test_rules(root)
        if len(candidates) == 0: break
        r, node = candidates[randint(0, len(candidates)-1)]
        newn = r.apply(node)
        if node == root:
            root = newn
    print(i)

    return root


def transform_tree(tree):
    tree = random_apply_rules(tree, 1000)
    return tree
