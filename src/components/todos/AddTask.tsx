'use client'
import { useState } from 'react';

type AddTaskProps = {
    onAddTask: (text: string) => void;
};

export default function AddTask({ onAddTask }: AddTaskProps) {
    const [text, setText] = useState('');
    return (
        <>
            <input
                placeholder="Add task"
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button onClick={() => {
                setText('');
                onAddTask(text);
            }}>Add</button>
        </>
    )
}
