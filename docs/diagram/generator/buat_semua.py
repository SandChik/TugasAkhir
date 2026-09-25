# -*- coding: utf-8 -*-
"""Bangun ulang diagram BAB IV.
   python buat_semua.py                  -> semua, font bawaan
   python buat_semua.py --font 11        -> semua, label 11 px (teks lain ikut rasio), geometri tetap
   python buat_semua.py --geom 1.2       -> geometri dikali 1,2 saja
   python buat_semua.py --font 11 flow.py iv4 arch.py   -> sebagian"""
import os, sys, runpy
sys.stdout.reconfigure(encoding="utf-8")
D = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
for opt, env in (("--font", "DIAGRAM_FONT"), ("--geom", "DIAGRAM_GEOM")):
    if opt in args:
        i = args.index(opt); os.environ[env] = args[i+1]; del args[i:i+2]
URUT = ["flow.py", "arch.py", "iv6.py", "iv7.py", "l2.py", "sc2.py", "erd2.py", "menu.py", "wire.py", "uji.py"]
skrip, ekstra = [], {}
for a in args:
    if a.endswith(".py"): skrip.append(a); ekstra[a] = []
    elif skrip: ekstra[skrip[-1]].append(a)
for fn in (skrip or URUT):
    print("==", fn, " ".join(ekstra.get(fn, [])))
    sys.argv = [fn] + ekstra.get(fn, [])
    runpy.run_path(os.path.join(D, fn), run_name="__main__")
