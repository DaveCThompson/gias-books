'use client';

import { useParams } from 'next/navigation';
import { EditorShell } from '@/components/Editor/EditorShell';

export default function EditPage() {
    const params = useParams();
    const slug = params.slug as string;

    return <EditorShell bookSlug={slug} />;
}
