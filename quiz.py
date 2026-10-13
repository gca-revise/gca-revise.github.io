import csv
import random


class VocabQuiz:
    """A vocab quiz. Reads words from a CSV file with columns: word, definition.

    Two modes:
      - "set":  learn the whole set. A word is retired once answered correctly;
                missed words come back. Finishes when every word is retired.
      - "free": endless practice. Nothing is retired. Runs until the player quits.
    """

    def __init__(self, filename="vocab.csv", mode="set"):
        with open(filename, newline="", encoding="utf-8") as f:
            self.words = list(csv.DictReader(f))
        if not self.words:
            raise ValueError(f"{filename} has no words in it.")
        self.mode = mode
        self.deck = []          # words still to ask in this round
        self.last_word = None   # the word asked most recently
        self.retired = set()    # words already learned (set mode only)
        self.word_right = {w["word"]: 0 for w in self.words}
        self.word_wrong = {w["word"]: 0 for w in self.words}
        self.points = 0
        self.right = 0
        self.wrong = 0
        self.streak = 0
        self.best_streak = 0

    def is_complete(self):
        return self.mode == "set" and len(self.retired) == len(self.words)

    def next_question(self):
        """Pick the next word, or None if the set is complete.

        Every word is used once before any comes round again, and the same
        word is never asked twice in a row (unless it is the only one left).
        """
        if self.is_complete():
            return None
        if not self.deck:
            self.deck = [w for w in self.words if w["word"] not in self.retired]
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
        """Return True if correct. Updates the score, streak and stats."""
        word = question["word"]
        if self.clean(answer) == self.clean(word):
            self.points += 1
            self.right += 1
            self.word_right[word] += 1
            self.streak += 1
            self.best_streak = max(self.best_streak, self.streak)
            if self.mode == "set":
                self.retired.add(word)
            return True
        self.wrong += 1
        self.word_wrong[word] += 1
        self.streak = 0
        return False

    def trickiest(self, how_many=3):
        """The words answered wrongly most often (only words with at least one miss)."""
        missed = [(n, w) for w, n in self.word_wrong.items() if n > 0]
        missed.sort(reverse=True)
        return missed[:how_many]

    def summary(self):
        lines = [
            "\n--- Summary ---",
            f"Points: {self.points}",
            f"Right: {self.right}",
            f"Wrong: {self.wrong}",
            f"Best streak: {self.best_streak}",
        ]
        if self.mode == "set":
            lines.append(f"Words learned: {len(self.retired)} of {len(self.words)}")
        tricky = self.trickiest()
        if tricky:
            lines.append("Trickiest words:")
            for n, word in tricky:
                lines.append(f"  {word} (missed {n} time{'s' if n != 1 else ''})")
        return "\n".join(lines)

    def run(self):
        print("Type the word that matches each definition. Type q to quit.\n")
        while True:
            question = self.next_question()
            if question is None:
                print("*** Set complete! You've learned every word. ***")
                break
            print(f"Definition: {question['definition']}")
            answer = input("Word: ")
            if self.clean(answer) == "q":
                break
            if self.check_answer(question, answer):
                print("Correct!")
            else:
                print(f"Not quite. The word was: {question['word']}")
            progress = ""
            if self.mode == "set":
                progress = f"  |  Learned: {len(self.retired)}/{len(self.words)}"
            print(f"Score: {self.points}{progress}\n")
        print(self.summary())


def choose_mode():
    print("1 = Learn the set (finish when you know every word)")
    print("2 = Free practice (endless)")
    while True:
        choice = input("Choose 1 or 2: ").strip()
        if choice == "1":
            return "set"
        if choice == "2":
            return "free"


if __name__ == "__main__":
    VocabQuiz(mode=choose_mode()).run()
