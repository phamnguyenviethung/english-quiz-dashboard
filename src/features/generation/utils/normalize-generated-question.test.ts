import { describe, expect, it } from "vitest"

import type { GeneratedQuestionData } from "../types.ts"
import { normalizeGeneratedQuestion } from "./normalize-generated-question.ts"

const usage = { inputTokens: 10, outputTokens: 20, model: "test-model" }

function correctText(data: GeneratedQuestionData): string | undefined {
  return normalizeGeneratedQuestion(data).options.find(
    (option) => option.isCorrect
  )?.text
}

describe("normalizeGeneratedQuestion", () => {
  it("đặt đáp án đúng lên đầu và gắn giải thích cho đáp án sai", () => {
    const view = normalizeGeneratedQuestion({
      quizType: "vocab",
      question: {
        word: "resilient",
        partOfSpeech: "adjective",
        correctAnswer: "able to recover quickly",
        wrongAnswers: ["very tired", "extremely loud"],
        wrongAnswerExplanations: ["sai nghĩa", "không liên quan"],
        explanation: "giải thích",
        exampleSentence: "She is resilient.",
        exampleTranslation: "Cô ấy kiên cường.",
      },
      usage,
    })

    expect(view.prompt).toBe("resilient")
    expect(view.options[0]).toMatchObject({
      text: "able to recover quickly",
      isCorrect: true,
    })
    expect(view.options[1]).toMatchObject({
      text: "very tired",
      isCorrect: false,
      explanation: "sai nghĩa",
    })
    expect(view.example?.translation).toBe("Cô ấy kiên cường.")
    expect(view.meta).toContainEqual({ label: "Từ loại", value: "Tính từ" })
    expect(view.usage).toEqual(usage)
  })

  it("odd-one-out: đáp án đúng là oddWord nằm trong groupWords", () => {
    const view = normalizeGeneratedQuestion({
      quizType: "odd-one-out",
      question: {
        oddWord: "carrot",
        groupTheme: "Trái cây",
        groupWords: ["apple", "carrot", "banana", "orange"],
        groupWordExplanations: ["quả", "củ", "quả", "quả"],
        explanation: "carrot là củ",
        exampleSentence: "I ate an apple.",
        exampleTranslation: "Tôi ăn một quả táo.",
      },
    })

    expect(view.prompt).toBe("Trái cây")
    expect(view.options).toHaveLength(4)
    expect(view.options.filter((option) => option.isCorrect)).toHaveLength(1)
    expect(view.options[1]).toMatchObject({
      text: "carrot",
      isCorrect: true,
      explanation: "củ",
    })
  })

  it("paragraph: dùng correctStatement/wrongStatements và không có example", () => {
    const view = normalizeGeneratedQuestion({
      quizType: "paragraph",
      question: {
        paragraph: "A short paragraph.",
        correctStatement: "Đúng",
        wrongStatements: ["Sai 1", "Sai 2"],
        wrongStatementExplanations: ["vì a", "vì b"],
        explanation: "giải thích",
        translation: "Một đoạn ngắn.",
      },
    })

    expect(view.example).toBeUndefined()
    expect(view.contextBlocks[0]).toMatchObject({
      kind: "paragraph",
      translation: "Một đoạn ngắn.",
    })
    expect(view.options[0]).toMatchObject({ text: "Đúng", isCorrect: true })
    expect(view.options[1]).toMatchObject({
      text: "Sai 1",
      explanation: "vì a",
    })
  })

  it("verb-use-match: targetPhrase là đáp án đúng, fallback verb + noun", () => {
    const question = {
      format: "fill-blank" as const,
      targetPhrase: "take a break",
      verb: "take",
      noun: "break",
      sentence: "You should ___ now.",
      wrongAnswers: ["make a break", "do a break"],
      wrongAnswerExplanations: ["sai collocation", "sai collocation"],
      explanation: "giải thích",
      exampleSentence: "Let us take a break.",
      exampleTranslation: "Nghỉ một lát nào.",
    }

    expect(correctText({ quizType: "verb-use-match", question })).toBe(
      "take a break"
    )

    expect(
      correctText({
        quizType: "verb-use-match",
        question: { ...question, targetPhrase: "" },
      })
    ).toBe("take break")
  })

  it("reading: số được đổi sang chuỗi và giữ chiến thuật gây nhiễu", () => {
    const view = normalizeGeneratedQuestion({
      quizType: "reading",
      question: {
        distractorTactic: "UNIT_MISMATCH",
        context: "There are 12 apples.",
        questionSentence: "How many apples?",
        correctAnswer: 12,
        wrongAnswers: [10, 14, 20],
        translation: "Có 12 quả táo.",
        explanation: "đếm trực tiếp",
      },
    })

    expect(view.options.map((o) => o.text)).toEqual(["12", "10", "14", "20"])
    expect(view.options[0].isCorrect).toBe(true)
    expect(view.meta).toContainEqual({
      label: "Chiến thuật gây nhiễu",
      value: "Sai đơn vị",
    })
  })

  describe("optionTranslations", () => {
    const base = {
      word: "run",
      sentence: "I ___ every day.",
      sentenceTranslation: "Tôi ___ mỗi ngày.",
      highlightedWord: "run",
      correctAnswer: "run",
      correctAnswerTranslation: "chạy",
      wrongAnswers: ["walks", "ran"],
      wrongAnswerExplanations: ["sai ngôi", "sai thì"],
      explanation: "giải thích",
      exampleSentence: "I run.",
      exampleTranslation: "Tôi chạy.",
    }

    it("khớp số đáp án sai thì gán cho đáp án sai", () => {
      const view = normalizeGeneratedQuestion({
        quizType: "fillblank",
        question: { ...base, optionTranslations: ["đi bộ", "đã chạy"] },
      })
      expect(view.options[1].translation).toBe("đi bộ")
      expect(view.options[2].translation).toBe("đã chạy")
    })

    it("thừa một phần tử thì phần tử đầu thuộc đáp án đúng", () => {
      const view = normalizeGeneratedQuestion({
        quizType: "fillblank",
        question: {
          ...base,
          correctAnswerTranslation: "",
          optionTranslations: ["chạy", "đi bộ", "đã chạy"],
        },
      })
      expect(view.options[0].translation).toBe("chạy")
      expect(view.options[1].translation).toBe("đi bộ")
    })

    it("độ dài lạ thì bỏ hẳn bản dịch của đáp án sai", () => {
      const view = normalizeGeneratedQuestion({
        quizType: "fillblank",
        question: { ...base, optionTranslations: ["chỉ một"] },
      })
      expect(view.options[1].translation).toBeUndefined()
      expect(view.options[2].translation).toBeUndefined()
    })
  })
})
