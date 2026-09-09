# -*- coding: utf-8 -*-
"""Bangun ulang seluruh diagram BAB IV: python buat_semua.py [nama_skrip ...]"""
import os, sys, runpy
D = os.path.dirname(os.path.abspath(__file__))
URUT = ["flow.py", "arch.py", "iv6.py", "iv7.py", "l2.py", "sc2.py", "erd2.py"]
for fn in (sys.argv[1:] or URUT):
    print("==", fn)
    runpy.run_path(os.path.join(D, fn), run_name="__main__")
