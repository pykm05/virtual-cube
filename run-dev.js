
import { spawn } from "child_process";

const run = (cmd, args, name) => {
  const proc = spawn(cmd, args, { stdio: "inherit", shell: true });
  proc.on("close", code => {
    console.log(`${name} exited with code ${code}`);
    process.exit(code);
  });
};

run("nodemon", ["--watch", "src", "--ext", "ts,tsx", "--exec", "tsx src/server/main.ts"], "Backend");
run("next", ["dev"], "Frontend");
