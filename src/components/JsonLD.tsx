export default function JsonLd<T>({ id, data }: { id: string; data: T }) {
    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
