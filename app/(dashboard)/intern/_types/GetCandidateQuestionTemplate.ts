export type QuestionTemplateDetails = {
  name: string;
  totalQuestionScore: number;
  totalAnswerScore: number;
  result: string;
  candidateName: string;
  questionTemplateDetails: QuestionTemplateDetail[];
  reviewerName: string;
  id: string;
  dateCreate: string;
  dateUpdate: string;
  isDeleted: boolean;
};

export type QuestionTemplateDetail = {
  interviewQuestion: InterviewQuestion;
  maxQuestionScore: string;
  answerScore: number;
  interviewAnswers: any[]; // Replace `any` with the appropriate type if known
  id: string;
  dateCreate: string;
  dateUpdate: string;
  isDeleted: boolean;
};

export type InterviewQuestion = {
  content: string;
  imageUri: string;
  difficulty: number;
  id: string;
  dateCreate: string;
  dateUpdate: string;
  isDeleted: boolean;
};

export type GetCandidateQuestionTemplateResponse = {
  statusCode: string;
  message: string;
  data: QuestionTemplateDetails;
};
