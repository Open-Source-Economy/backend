import * as anchor from "@coral-xyz/anchor";
import { IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { Poc } from "../../target/types/poc";
import { programPda } from "./config";

export type Project = IdlAccounts<Poc>["project"];
export type ABC = IdlTypes<Poc>["ABC"];

export class DataFetcher {
  private readonly program: anchor.Program<Poc>;

  // TODO: add a cache to fetch data every time

  constructor(program: anchor.Program<Poc>) {
    this.program = program;
  }

  async getProject(owner: string, repository: string): Promise<Project> {
    const [project, _] = programPda.project(owner, repository, this.program.programId);
    return await this.program.account.project.fetch(project);
  }

  async getABC(owner: string, repository: string): Promise<ABC> {
    const project = await this.getProject(owner, repository);
    return project.abc;
  }
}
