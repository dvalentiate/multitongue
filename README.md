# Multitongue

Show only the language of the user on a multilingual page, using javascript.

## How It Works

Write your content in all your languages. Start a content block with a block 
delimiter (....) and end it with the same delimiter. Within the content block 
separate your languages with a separating delimiter (..).

Multitongue looks for content blocks and removes from the page (DOM) all the 
content not of the choosen language.

To use multitongue reference it with the `<script>` tag. This is usually 
either within the `<head>` tag or at the end of your page, but before the 
closing `</body>` tag.

## What's Good

- many languages, can handle as you feel confortable putting on one page
- any language, whatever you can encode in HTML
- fast, blink and a typical page will be reduced to the choosen language
- small
  - less than 2.7 KB of minified code for bare minimum
  - 4.5 KB of minified code for batteries included setup that picks language 
  based on browser's language, and provides option for user to change the 
  language.
- modular design
- customizable delimiters
- easy to implement
- easy to modify content
- easy to compare content across languages

## What's Bad

- Search engine results may show the delimiters in the search result. For 
instance Google.
- Jitter may happen as the page loads

## Usage

### Get this repository:

```sh
git clone https://github.com/dvalentiate/multitongue.git
cd multitongue
```

### Build the minimized version and examples:

```sh
npm install
```

### Including It On Your Page

See examples in your build/examples directory, particularly `squarespace-with-selector.html`.

### Prebuilt Version

For convenience I have created the [Multitongue build repository](https://github.com/dvalentiate/multitongue-build) that has the minimized versions of this project's various compoments.

## Credit Where It Is Due

This project was inspired by the [multilingualizer product/service](http://www.affiliatewebdesigners.com/multilingualizer-demo/) of [Affliate Web Designers](http://www.affiliatewebdesigners.com/). They seem like good folk.  While extensive testing hasn't been done it is expected that this project improves on both the download size and page processing time over Multilingualizer.
