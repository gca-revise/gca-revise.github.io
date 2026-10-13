import csv
import random


class VocabQuiz:
    """An endless vocab quiz. Reads words from a CSV file with columns: word, definition."""

    def __init__(self, filename="vocab.csv"):
        with open(filename, newline="", encoding="utf-8") as f:
            self.words = list(csv.DictReader(f))
        if not self.words:
            raise ValueError(f"{filename} has no words in it.")
        self.deck = []          # words still to ask in this round
        self.last_word = None   # the word asked most recently
        self.points = 0
        self.right = 0
        self.wrong = 0
        self.streak = 0
        self.best_streak = 0

    def next_question(self):
        """Pick the next word. Every word is used once before any comes round again,
        and the same word is never asked twice in a row."""
        if not self.deck:
            self.deck = self.words[:]
            random.shuffle(self.deck)
            # Avoid the new round starting with the word we just asked.
            if len(self.deck) > 1 and self.deck[-1]["word"] == self.last_word:
                self.deck[0], self.deck[-1] = self.deck[-1], self.deck[0]
        question = self.deck.pop()
        self.last_word = question["word"]
        return question

    @staticmethod
    def clean(text):
        """Ignore capitals and extra spaces."""
        return " ".join(text.lower().split())

    def check_answer(self, question, answer):
        """Return True if correct. Updates the score and streak."""
        if self.clean(answer) == self.clean(question["word"]):
            self.points += 1
            self.right += 1
            self.streak += 1
            self.best_streak = max(self.best_streak, self.streak)
            return True
        self.wrong += 1
        self.streak = 0
        return False

    def summary(self):
        return (
            "\n--- Summary ---\n"
            f"Points: {self.points}\n"
            f"Right: {self.right}\n"
            f"Wrong: {self.wrong}\n"
            f"Best streak: {self.best_streak}"
        )

    def run(self):
        print("Type the word that matches each definition. Type q to quit.\n")
        while True:
            question = self.next_question()
            print(f"Definition: {question['definition']}")
            answer = input("Word: ")
            if self.clean(answer) == "q":
                break
            if self.check_answer(question, answer):
                print("Correct!")
            else:
                print(f"Not quite. The word was: {question['word']}")
            print(f"Score: {self.points}\n")
        print(self.summary())


if __name__ == "__main__":
    VocabQuiz().run()
