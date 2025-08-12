import { IsString } from "class-validator";

export class SearchUserDto {
  @IsString()
  query: string;

  @IsString()
  projectId: string;
}

export class getMember {
  @IsString()
  projectId: string;

  @IsString()
  memberId: string;
}