import nlp from 'compromise'
import scan from 'compromise-scan'
import vocab from '@/language/vocab'
nlp.extend(scan) // Add compromise-scan plugin

// create a compressed lookup trie
// https://observablehq.com/@spencermountain/compromise-scan
const trie = nlp.buildTrie(vocab)
export default (input) => {
  const doc = nlp(input)
  const result = doc.scan(trie)
  if (result.length > 0) {
    return result.out('string')
  } else {
    return ''
  }
}
