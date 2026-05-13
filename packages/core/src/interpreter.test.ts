import {
  describe,
  it,
  expect
} from "vitest";

import {
  IRInterpreter
} from "./interpreter";

describe(
  "IRInterpreter",
  () => {

    it(
      "converts final response nodes into return instructions",
      () => {

        const interpreter =
          new IRInterpreter();

        const instructions =
          interpreter.interpret([
            {
              type:
                "final-response",

              content:
                "hello"
            }
          ]);

        expect(
          instructions
        ).toEqual([
          {
            type: "return",

            content: "hello"
          }
        ]);
      }
    );
  }
);