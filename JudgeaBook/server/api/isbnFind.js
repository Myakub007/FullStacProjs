const axios = require("axios");
const { v4: uuidv4 } = require('uuid');

async function isbnFind(title, author) {
  const queryTitle = encodeURIComponent(title);
  const queryAuthor = encodeURIComponent(author);
  const url = `https://openlibrary.org/search.json?title=${queryTitle}&author=${queryAuthor}`;

  try {
    const res = await axios.get(url);
    const books = res.data.docs;
    const editionKey = books[0].cover_edition_key;
    const workKey = books[0].key.split('/')[-1];
    // console.log(res.data.docs[0]);

    if (books.length === 0) return uuidv4();

    // Return the first found ISBN-13 or ISBN-10
    const isbn = books[0].isbn?.find(code => code.length === 13 || code.length === 10);
    if (isbn) {
      return isbn
    }
    if (!isbn) {
      const url1 = `https://openlibrary.org/books/${editionKey}.json`;

      try {
        const res = await axios.get(url1);
        const book = res.data;

        if (book.isbn_13 && book.isbn_13.length > 0) return book.isbn_13[0];
        if (book.isbn_10 && book.isbn_10.length > 0) return book.isbn_10[0];

        if (!book.isbn_13 && !book.isbn_10) {
          const url2 = `https://openlibrary.org${workKey}/editions.json`;

          try {
            const res = await axios.get(url2);
            const editions = res.data.entries;

            for (const ed of editions) {
              if (ed.isbn_13 && ed.isbn_13.length > 0) return ed.isbn_13[0];
              if (ed.isbn_10 && ed.isbn_10.length > 0) return ed.isbn_10[0];
            }

            return uuidv4();
          } catch (err) {
            console.error("Error fetching editions:", err.message);
            return uuidv4();
          }
        }
      } catch (err) {
        console.error("Edition fetch error:", err.message);
        return uuidv4();
      }
    }
  } catch (err) {
    console.error("Error fetching ISBN:", err.message);
    return uuidv4();
  }
}

module.exports = isbnFind;