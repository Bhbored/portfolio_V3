import { queryOptions } from "@tanstack/react-query";
import { supabase } from "../../shared/api/supabase";
import {
  STALE_TIME,
  asTimestamp,
  stripTimestamps,
  throwIfError,
} from "../../shared/api/supabase-utils";
import type { Certificate, Skill, Writable } from "../../shared/types";

export type CertificateRow = Omit<Certificate, "top_skills">;
export type NewCertificate = Writable<CertificateRow>;

export const certificateKeys = {
  all: ["certificates"] as const,
  list: () => [...certificateKeys.all, "list"] as const,
};

function normalizeCertificate(row: CertificateRow): CertificateRow {
  return {
    ...row,
    year: row.year ?? "",
    link: row.link ?? null,
    priority: Number(row.priority ?? 1),
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

export async function fetchCertificates(): Promise<CertificateRow[]> {
  const result = await supabase
    .from("certificates")
    .select("*")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
  const rows = await throwIfError(result, "certificates");
  return ((rows ?? []) as CertificateRow[]).map(normalizeCertificate);
}

export async function createCertificate(
  row: NewCertificate,
): Promise<CertificateRow> {
  const result = await supabase
    .from("certificates")
    .insert(stripTimestamps(row))
    .select()
    .single();
  const data = await throwIfError(result, "certificates.create");
  return normalizeCertificate(data as CertificateRow);
}

export async function updateCertificate(
  id: string,
  row: NewCertificate,
): Promise<CertificateRow> {
  const result = await supabase
    .from("certificates")
    .update(stripTimestamps(row))
    .eq("id", id)
    .select()
    .single();
  const data = await throwIfError(result, "certificates.update");
  return normalizeCertificate(data as CertificateRow);
}

export async function deleteCertificate(id: string): Promise<void> {
  const result = await supabase.from("certificates").delete().eq("id", id);
  await throwIfError(result, "certificates.delete");
}

export function getTop3SkillsByCertificateId(
  skills: Skill[],
  certificateId: string,
): Skill[] {
  return skills
    .filter((s) => s.certificate_id === certificateId)
    .sort((a, b) => b.mastery_level - a.mastery_level)
    .slice(0, 3);
}

export function withCertificateTopSkills(
  certificates: CertificateRow[],
  skills: Skill[],
): Certificate[] {
  return certificates.map((cert) => ({
    ...cert,
    top_skills: getTop3SkillsByCertificateId(skills, cert.id),
  }));
}

export const certificateQueries = {
  list: () =>
    queryOptions({
      queryKey: certificateKeys.list(),
      queryFn: fetchCertificates,
      staleTime: STALE_TIME,
    }),
};
