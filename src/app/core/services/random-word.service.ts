import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, timer } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RandomWordService {
  private readonly apiUrl = 'https://api.datamuse.com/words';
  private readonly dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  constructor(private http: HttpClient) { }

  getRandomFiveLetterWord(): Observable<string> {
    const params = {
      sp: '?????', // 5 letters
      max: '1000',   // get up to 1000 words to choose from
    };

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(words => {
        if (!words || words.length === 0) {
          throw new Error('No words found');
        }
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex].word;
      }),
      catchError(error => {
        console.error('Error fetching word:', error);
        return of(this.getFallbackWord()); // Fallback to local word
      })
    );
  }

  isValidWord(word: string): Observable<boolean> {
    if (!word || word.length !== 5) return of(false);
    
    // First check our fallback words
    if (this.getFallbackWordList().includes(word.toLowerCase())) {
      return of(true);
    }
    
    // Then check dictionary API
    return this.http.get<any>(`${this.dictionaryApiUrl}/${word}`).pipe(
      map(() => true), // If we get a response, word is valid
      catchError(() => of(false)) // If error, word is invalid
    );
  }

  private getFallbackWord(): string {
    return this.getFallbackWordList()[
      Math.floor(Math.random() * this.getFallbackWordList().length)
    ];
  }

  private getFallbackWordList(): string[] {
    return ['apple', 'beach', 'candy', 'dance', 'earth', 
            'fairy', 'ghost', 'happy', 'igloo', 'jelly',
            'karma', 'lemon', 'mango', 'noble', 'olive',
            'peach', 'queen', 'river', 'sunny', 'tiger',
            'umbra', 'vivid', 'water', 'xenon', 'yacht', 'zebra'];
  }
}