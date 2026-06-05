/**
 * LatexText — render text có thể chứa công thức LaTeX inline ($...$) hoặc block ($$...$$).
 *
 * Ví dụ sử dụng:
 *   <LatexText text="Công thức nước: $H_2O$, năng lượng $E = mc^2$" />
 *   <LatexText text="$$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$" block />
 *
 * Hỗ trợ cú pháp LaTeX thường dùng:
 *   - Chỉ số dưới: H_2O  →  H₂O
 *   - Chỉ số trên: x^2   →  x²
 *   - Phân số: \frac{a}{b}
 *   - Căn: \sqrt{x}
 *   - Mũi tên: \rightarrow, \leftarrow
 *   - Chữ Hy Lạp: \alpha, \beta, \gamma …
 *   - Dấu ±: \pm
 */

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
    /** Chuỗi văn bản có thể chứa $...$ hoặc $$...$$ */
    text: string;
    className?: string;
    /** Nếu true, render toàn bộ text dưới dạng block LaTeX */
    block?: boolean;
}

/** Render một biểu thức LaTeX đơn, trả về HTML string */
function renderLatex(expr: string, displayMode: boolean): string {
    try {
        return katex.renderToString(expr, {
            displayMode,
            throwOnError: false,
            strict: false,
            trust: true,
            macros: {
                '\\ce': '\\mathrm{#1}', // basic chemistry notation fallback
            },
        });
    } catch {
        return expr;
    }
}

/** Tách văn bản thành các segment: plain text / inline latex / block latex */
function parseSegments(text: string): Array<{ type: 'text' | 'inline' | 'block'; content: string }> {
    const segments: Array<{ type: 'text' | 'inline' | 'block'; content: string }> = [];
    // Match $$...$$ first (block), then $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        // Plain text before this match
        if (match.index > lastIndex) {
            segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }

        const raw = match[0];
        if (raw.startsWith('$$')) {
            segments.push({ type: 'block', content: raw.slice(2, -2) });
        } else {
            segments.push({ type: 'inline', content: raw.slice(1, -1) });
        }
        lastIndex = regex.lastIndex;
    }

    // Remaining plain text
    if (lastIndex < text.length) {
        segments.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return segments;
}

export function LatexText({ text, className = '', block = false }: LatexTextProps) {
    const html = useMemo(() => {
        if (!text) return '';

        if (block) {
            // Render toàn bộ như một block LaTeX
            return renderLatex(text, true);
        }

        const segments = parseSegments(text);

        return segments
            .map(seg => {
                if (seg.type === 'text') {
                    // Escape HTML để tránh XSS
                    return seg.content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                }
                return renderLatex(seg.content, seg.type === 'block');
            })
            .join('');
    }, [text, block]);

    if (!text) return null;

    return (
        <span
            className={`latex-text ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default LatexText;
