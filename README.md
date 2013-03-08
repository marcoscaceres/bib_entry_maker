# Biblio Entry Maker 2000

Makes bibliographical entries for Respec.js.

[access it online](http://marcoscaceres.github.com/bib_entry_maker/)

# What's it for?

tl;dr:

 1. Look up exisiting bibliographical entries. 
 2. Created new bilbiographical entries.

## Look up references

When you are working on a spec you often need to add references to specs:

> ... parsing is specified in the [[!FOO]] specification. 

However, remembering all the keys is annoying. This application provides you a quick and easy way to lookg up keys. 

## Create new entries

Creating references is also fairly annoying: you have to load up the document and <kbd>cmd/alt-tab</kbd> back and forth between the browser and text editor to create the entry. You also need to know what fields to use, yada yada. 

This app takes some of the pain by generating the conforming JSON for you (other formats coming soon). When CORS allows, it will load up a spec and try to get as much data for you as possible (e.g., the authors). This takes some of the pain away when creating a reference. 
