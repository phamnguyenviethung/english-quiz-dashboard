import {
  DESCRIPTION_LANGUAGE_LABELS,
  DISTRACTOR_TACTIC_LABELS,
  PART_OF_SPEECH_LABELS,
  QUESTION_TYPE_LABELS,
  VERB_USE_FORMAT_LABELS,
  labelFor,
} from "../constants.ts"
import type {
  GeneratedContextBlock,
  GeneratedOption,
  GeneratedQuestionData,
  GeneratedQuestionView,
  GeneratedMetaItem,
} from "../types.ts"

function buildOptions({
  correct,
  correctTranslation,
  correctExplanation,
  wrongs,
  wrongTranslations,
  wrongExplanations,
}: {
  correct: string
  correctTranslation?: string
  correctExplanation?: string
  wrongs: string[]
  wrongTranslations?: (string | undefined)[]
  wrongExplanations?: string[]
}): GeneratedOption[] {
  return [
    {
      text: correct,
      isCorrect: true,
      translation: correctTranslation,
      explanation: correctExplanation,
    },
    ...wrongs.map((text, index) => ({
      text,
      isCorrect: false,
      translation: wrongTranslations?.[index],
      explanation: wrongExplanations?.[index],
    })),
  ]
}

/**
 * `optionTranslations` không nói rõ có gồm đáp án đúng hay không. Chỉ nhận khi
 * độ dài khớp một trong hai cách hiểu, còn lại bỏ hẳn để không gán nhầm.
 */
function alignTranslations(
  optionTranslations: string[],
  wrongCount: number
): { correct?: string; wrongs?: (string | undefined)[] } {
  if (optionTranslations.length === wrongCount) {
    return { wrongs: optionTranslations }
  }
  if (optionTranslations.length === wrongCount + 1) {
    return {
      correct: optionTranslations[0],
      wrongs: optionTranslations.slice(1),
    }
  }
  return {}
}

function sentenceBlock(
  sentence: string,
  translation: string,
  highlight?: string
): GeneratedContextBlock {
  return {
    kind: "sentence",
    label: "Câu hỏi",
    lines: [sentence],
    translation,
    highlight,
  }
}

function metaOf(
  entries: (GeneratedMetaItem | undefined)[]
): GeneratedMetaItem[] {
  return entries.filter(
    (entry): entry is GeneratedMetaItem => entry !== undefined
  )
}

export function normalizeGeneratedQuestion(
  data: GeneratedQuestionData
): GeneratedQuestionView {
  const base = { quizType: data.quizType, usage: data.usage, raw: data }

  switch (data.quizType) {
    case "vocab": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Từ vựng",
        prompt: q.word,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          {
            label: "Từ loại",
            value: labelFor(PART_OF_SPEECH_LABELS, q.partOfSpeech),
          },
        ]),
      }
    }

    case "phrase": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Cụm từ",
        prompt: q.phrase,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: [],
      }
    }

    case "slang": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Tiếng lóng",
        prompt: q.slang,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          {
            label: "Từ loại",
            value: labelFor(PART_OF_SPEECH_LABELS, q.partOfSpeech),
          },
        ]),
      }
    }

    case "idiom": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Thành ngữ",
        prompt: q.idiom,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: [],
      }
    }

    case "synonym": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Từ khoá",
        prompt: q.word,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          {
            label: "Dạng hỏi",
            value: labelFor(QUESTION_TYPE_LABELS, q.questionType),
          },
          {
            label: "Từ loại",
            value: labelFor(PART_OF_SPEECH_LABELS, q.partOfSpeech),
          },
        ]),
      }
    }

    case "description": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Mô tả",
        prompt: q.description,
        contextBlocks: [],
        options: buildOptions({
          correct: q.correctAnswer,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          {
            label: "Ngôn ngữ mô tả",
            value: labelFor(DESCRIPTION_LANGUAGE_LABELS, q.descriptionLanguage),
          },
          {
            label: "Từ loại",
            value: labelFor(PART_OF_SPEECH_LABELS, q.partOfSpeech),
          },
        ]),
      }
    }

    case "fillblank": {
      const q = data.question
      const aligned = alignTranslations(
        q.optionTranslations,
        q.wrongAnswers.length
      )
      return {
        ...base,
        promptLabel: "Từ vựng",
        prompt: q.word,
        contextBlocks: [
          sentenceBlock(q.sentence, q.sentenceTranslation, q.highlightedWord),
        ],
        options: buildOptions({
          correct: q.correctAnswer,
          correctTranslation: q.correctAnswerTranslation || aligned.correct,
          wrongs: q.wrongAnswers,
          wrongTranslations: aligned.wrongs,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          q.highlightedWord
            ? { label: "Từ được nhấn", value: q.highlightedWord }
            : undefined,
        ]),
      }
    }

    case "conversation": {
      const q = data.question
      const aligned = alignTranslations(
        q.optionTranslations,
        q.wrongAnswers.length
      )
      return {
        ...base,
        promptLabel: "Từ được nhấn",
        prompt: q.highlightedWord,
        contextBlocks: [
          {
            kind: "dialogue",
            label: "Hội thoại",
            lines: q.dialogueLines,
          },
          sentenceBlock(q.sentence, q.sentenceTranslation, q.highlightedWord),
        ],
        options: buildOptions({
          correct: q.correctAnswer,
          correctTranslation: q.correctAnswerTranslation || aligned.correct,
          wrongs: q.wrongAnswers,
          wrongTranslations: aligned.wrongs,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: [],
      }
    }

    case "odd-one-out": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Chủ đề nhóm từ",
        prompt: q.groupTheme,
        contextBlocks: [],
        options: q.groupWords.map((word, index) => ({
          text: word,
          isCorrect: word === q.oddWord,
          explanation: q.groupWordExplanations[index],
        })),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([{ label: "Từ lạc nhóm", value: q.oddWord }]),
      }
    }

    case "paragraph": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Yêu cầu",
        prompt: "Chọn phát biểu đúng về đoạn văn",
        contextBlocks: [
          {
            kind: "paragraph",
            label: "Đoạn văn",
            lines: [q.paragraph],
            translation: q.translation,
          },
        ],
        options: buildOptions({
          correct: q.correctStatement,
          wrongs: q.wrongStatements,
          wrongExplanations: q.wrongStatementExplanations,
        }),
        explanation: q.explanation,
        meta: [],
      }
    }

    case "verb-use-match": {
      const q = data.question
      const correct = q.targetPhrase || `${q.verb} ${q.noun}`.trim()
      return {
        ...base,
        promptLabel: "Cụm động từ",
        prompt: correct,
        contextBlocks: [
          { kind: "sentence", label: "Câu hỏi", lines: [q.sentence] },
        ],
        options: buildOptions({
          correct,
          wrongs: q.wrongAnswers,
          wrongExplanations: q.wrongAnswerExplanations,
        }),
        explanation: q.explanation,
        example: {
          sentence: q.exampleSentence,
          translation: q.exampleTranslation,
        },
        meta: metaOf([
          {
            label: "Dạng bài",
            value: labelFor(VERB_USE_FORMAT_LABELS, q.format),
          },
          { label: "Động từ", value: q.verb },
          { label: "Danh từ", value: q.noun },
        ]),
      }
    }

    case "reading": {
      const q = data.question
      return {
        ...base,
        promptLabel: "Câu hỏi",
        prompt: q.questionSentence,
        contextBlocks: [
          {
            kind: "prose",
            label: "Ngữ cảnh",
            lines: [q.context],
            translation: q.translation,
          },
        ],
        options: buildOptions({
          correct: String(q.correctAnswer),
          wrongs: q.wrongAnswers.map(String),
        }),
        explanation: q.explanation,
        meta: metaOf([
          {
            label: "Chiến thuật gây nhiễu",
            value: labelFor(DISTRACTOR_TACTIC_LABELS, q.distractorTactic),
          },
        ]),
      }
    }

    default: {
      const exhaustive: never = data
      throw new Error(
        `Loại câu hỏi chưa được hỗ trợ: ${JSON.stringify(exhaustive)}`
      )
    }
  }
}
