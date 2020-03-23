# README

support fuzzy search for tags.

## Features

"C++ Intellisense" is a very useful extension based on gtags.
However, it doesn't support fuzzy C/C++ tag search, which is a pity.
Refer to others' thoughts, a "fuzzy tag" extension is developed to provide a feature of fuzzy tag search based on GNU global gtags.

**Enjoy~**

-----------------------------------------------------------------------------------------------------------

KeyBinding: F10

Setting:
    fuzzy-tag.autoUpdate: Whether Gtags should update automatically or not when saving file. (default: false)

-----------------------------------------------------------------------------------------------------------

Demo:

<table align="center" width="100%" border="0">
  <tr>
    <td>
      <a title="Demo" href=""><img src="https://s2.ax1x.com/2019/05/20/EvmEh6.gif"/></a>
    </td>
  </tr>
</table>

-----------------------------------------------------------------------------------------------------------

## Requirements

1. please install GNU global and generate gtags files correctly.
2. please open files in workspace.
3. Chinese characters CANNOT be included in the workspace path.

-----------------------------------------------------------------------------------------------------------

### 0.0.3

Support smart case. 
For example, your input "abc" can match tags "abc" and "ABC", but input "Abc" will only match tag "ABC".

### 0.0.5

Fix a path bug on Mac OS.