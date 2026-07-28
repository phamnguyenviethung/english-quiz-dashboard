import { defineConfig } from "orval"

export default defineConfig({
  englishQuiz: {
    output: {
      mode: "tags-split",
      target: "src/apis/apiClient.ts",
      schemas: "src/apis/model",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "src/configs/axiosClient.ts",
          name: "axiosClient",
        },
      },
    },
    input: {
      target: "http://localhost:3399/openapi/json",
    },
  },
})
