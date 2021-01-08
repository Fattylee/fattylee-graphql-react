# from . import more
import math
import random
# print('Hello, world')
for i in range(1):
    pass
    # print(i)
    # print('last line', end='$')


def sum(a, b):
    return a+b


del sum

# print(sum(2, 4))
t = (1, 2, 3)
a = [1]

# print(random.randint(2, 9))
# print('Math value: %s' % math.pow(5, 2))

"""
    jsnjnsj
    jsnwjsnjw
    smws
"""


def pow(a, b, cb):
    return cb(a, b)


# ki

# print(int(pow(3, 3, math.pow)))
try:
    # 7/0
    # sjhjhs
    # 'jj'/2
    # s 'kmkm'
    raise SyntaxError
# except (ZeroDivisionError, NameError) as fatai:
#     print(fatai)
#     print('sweet')
# except TypeError as ex:
#     print('type-error', ex)
except SyntaxError:
    # print('backup except')
    pass
else:
    # print('this is else')
    pass
finally:
    # print('finally!!!!!!!!')
    pass

# print('no way')
# with open('./playground/more.py') as f:
#     print(f.readline())
#     print(f.readline())
#     f.close()


# for i in range(10) if (i % 2):
# print('Even: ', i)

# def ok(x):
#     pass


d = {
    'ab': 1,
    'a': [1, 23, 4],
    0: 2,
    '0': 12,
    'l': 90,
    'l': 80,
    True: 90,
    False: 12
}
l = [1, 2, 3]
l[2] = 2
l.append(8)
# d.clear()
d[True] = '12'
d[False] = '12'
# print(d.get('b', 8))
t = 12, 2, 3
print(l[:3])
print(t[::-1])
print(t[-1])
print(l)
print(l[-2:5])
