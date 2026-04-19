import { NextResponse } from 'next/server';
import { resolveUser } from '@/lib/auth/helpers';
import { interviewRepository } from '@/lib/db/repositories/interview.repository';
import { dbReady } from '@/lib/db';

export async function GET() {
  await dbReady;
  const user = await resolveUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const reportsWithSessions = await interviewRepository.findReportsByUserId(user.id);

  const sessions = reportsWithSessions.map(({ report, session }) => ({
    id: session.id,
    jobTitle: session.jobTitle,
    overallScore: report.overallScore,
    dimensionScores: report.dimensionScores,
    createdAt: session.createdAt,
  }));

  return NextResponse.json({ sessions });
}
