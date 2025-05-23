import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RandomWordService } from './core/services/random-word.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private randomWordService: RandomWordService) {}
  @ViewChildren('cellInput') cellInputs!: QueryList<ElementRef>;

  word: string = '';
  warningMessage: string = '';
  showWarning: boolean = false;
  isLoading: boolean = false;
  matrix: string[][] = this.createEmptyMatrix();
  userWords: string[] = [];
  currentActiveRow: number = 0;
  letterStates: {
    row: number;
    col: number;
    state: 'correct' | 'included' | 'wrong';
  }[] = [];
  isWon: boolean = false;
  isChanceCompleted: boolean = false;

  ngOnInit() {
    this.loadNewWord();
  }

  ngAfterViewInit() {
    this.focusCell(0, 0);
  }

  // private launchConfetti() {
  //   confetti({
  //     particleCount: 150,
  //     spread: 70,
  //     origin: { y: 0.6 },
  //   });
  // }

  loadNewWord() {
    this.isLoading = true;
    this.randomWordService.getRandomFiveLetterWord().subscribe((word) => {
      this.word = word.toLowerCase();
      console.log('Word:', this.word);
      this.isLoading = false;
    });
  }

  private createEmptyMatrix(): string[][] {
    return Array(5)
      .fill(null)
      .map(() => Array(5).fill(''));
  }

  onCellInput(row: number, col: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    this.matrix[row][col] = value;

    if (value && col < 4) {
      setTimeout(() => this.focusCell(row, col + 1));
    }
  }

  onKeyDown(row: number, col: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && col > 0) {
      setTimeout(() => this.focusCell(row, col - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.checkRowCompletion(row);
    } else if (event.key === 'ArrowRight' && col < 4) {
      event.preventDefault();
      this.focusCell(row, col + 1);
    } else if (event.key === 'ArrowLeft' && col > 0) {
      event.preventDefault();
      this.focusCell(row, col - 1);
    }
  }

  private checkRowCompletion(row: number) {
    const currentRow = this.matrix[row];
    const guess = currentRow.join('').toLowerCase();

    if (guess.length === 5) {
      this.randomWordService.isValidWord(guess).subscribe((isValid) => {
        if (isValid) {
          this.userWords[row] = guess;
          this.evaluateGuess(row, guess);

          // Check if guess matches the target word exactly
          if (guess === this.word) {
            console.log('Congratulations! You guessed the word correctly!');
            // this.launchConfetti();
            this.isWon = true;
            return; // Exit early since game is won
          }

          this.disableRow(row);

          if (row < 4) {
            this.currentActiveRow = row + 1;
            setTimeout(() => this.focusCell(row + 1, 0));
          } else {
            this.onAllRowsCompleted();
          }
        } else {
          this.showWarningMessage('Not a valid English word!');
          // Clear the invalid word
          this.matrix[row] = ['', '', '', '', ''];
          this.focusCell(row, 0);
        }
      });
    }
  }

  private showWarningMessage(message: string) {
    this.warningMessage = message;
    this.showWarning = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showWarning = false;
    }, 3000);
  }

  private evaluateGuess(row: number, guess: string) {
    const targetWord = this.word;
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');

    // First pass for correct positions (green)
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        this.letterStates.push({ row, col: i, state: 'correct' });
        targetLetters[i] = ''; // Mark as used
        guessLetters[i] = ''; // Mark as used
      }
    }

    // Second pass for included letters (yellow)
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === '') continue; // Skip already processed letters

      const foundIndex = targetLetters.indexOf(guessLetters[i]);
      if (foundIndex > -1) {
        this.letterStates.push({ row, col: i, state: 'included' });
        targetLetters[foundIndex] = ''; // Mark as used
      } else {
        this.letterStates.push({ row, col: i, state: 'wrong' });
      }
    }
  }

  getLetterState(row: number, col: number): string {
    const state = this.letterStates.find((s) => s.row === row && s.col === col);
    return state ? state.state : '';
  }

  private disableRow(row: number) {
    const inputs = this.getInputElementsForRow(row);
    inputs.forEach((input) => {
      input.nativeElement.disabled = true;
    });
  }

  private focusCell(row: number, col: number) {
    const input = this.getInputElement(row, col);
    if (input && !input.nativeElement.disabled) {
      input.nativeElement.focus();
      input.nativeElement.select();
    }
  }

  private getInputElement(row: number, col: number): ElementRef | undefined {
    const index = row * 5 + col;
    return this.cellInputs.toArray()[index];
  }

  private getInputElementsForRow(row: number): ElementRef[] {
    const startIndex = row * 5;
    return this.cellInputs.toArray().slice(startIndex, startIndex + 5);
  }

  private onAllRowsCompleted() {
    console.log('All words entered:', this.userWords);
    this.isChanceCompleted = true;
  }
  newGame() {
    // Reset all game state
    this.matrix = this.createEmptyMatrix();
    this.userWords = [];
    this.currentActiveRow = 0;
    this.letterStates = [];
    this.isWon = false;
    this.showWarning = false;
    this.isChanceCompleted = false;

    // Load a new word
    this.loadNewWord();

    // Focus first cell after a small delay to ensure view is updated
    setTimeout(() => this.focusCell(0, 0), 100);
  }
}
