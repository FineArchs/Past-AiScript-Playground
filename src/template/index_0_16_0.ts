import { Interpreter, Parser, values, utils, Ast } from "./version.ts";
import { version, samples } from "./version.ts";
import type { Log } from "@/MainArea.vue";

export { version, samples };

let ast: Ast.Node[] = [];
let interpreter: Interpreter | null = null;

export function parse(code: string): string {
  ast = Parser.parse(code);
  return JSON.stringify(ast, null, "\t");
}

export async function exec(io: {
  in: (q: string) => Promise<string>;
  out: (l: Log) => void;
  end: (l: Log) => void;
  err: (e: any) => void;
}): Promise<void> {
  interpreter?.abort();
  interpreter = new Interpreter(
    {},
    {
      in: io.in,
      out: (value: values.Value) => {
        io.out({
          id: Math.random(),
          type: value.type,
          text: utils.valToString(value, true),
          print: true,
        });
      },
      err: io.err,
      log: (type: string, params: Record<string, any>) => {
        switch (type) {
          case "end":
            io.end({
              id: Math.random(),
              text: utils.valToString(params.val, true),
              print: false,
            });
            break;
          default:
            break;
        }
      },
    },
  );

  try {
    await interpreter.exec(ast);
  } catch (e) {
    io.err(e);
  }
}
