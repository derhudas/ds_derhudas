const SUPABASE_URL = "https://cyevvhoessdlplpiiwdc.supabase.co";
const SUPABASE_KEY = "sb_publishable_M138Ywr1_yqE6B5i10yEZw_nUsCgwU1";

document.body.innerHTML += "<p>🚀 Mencoba terhubung...</p>";

// ============ KONFIGURASI GROQ ============
const GROQ_CONFIG = {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768', // atau 'llama3-70b-8192'
    temperature: 0.7,
    max_tokens: 1024
};

// ============ FUNGSI UTAMA ============
async function testConnection() {
    try {
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        // 1. Ambil data tasks dari Supabase
        const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .order('created_at', { ascending: false });

        if (tasksError) {
            throw new Error(`Supabase Error: ${tasksError.message}`);
        }

        // 2. Tampilkan tasks di UI
        renderTasks(tasks);

        // 3. Contoh: Analisis tasks dengan AI Groq
        await analyzeTasksWithGroq(tasks, supabase);

        // 4. Contoh: Generate rekomendasi task baru
        await generateTaskRecommendation(supabase);

    } catch (err) {
        document.body.innerHTML += `
            <div style="color: red; padding: 10px; border: 1px solid red; margin: 10px 0;">
                <strong>❌ Error:</strong><br>
                <pre>${err.message}</pre>
            </div>
        `;
        console.error('Error:', err);
    }
}

// ============ RENDER TASKS ============
function renderTasks(tasks) {
    const todoList = document.getElementById("todo-list");
    const doingList = document.getElementById("doing-list");
    const doneList = document.getElementById("done-list");

    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        document.body.innerHTML += "<p>📭 Belum ada tasks</p>";
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.margin = "10px 0";
        card.style.padding = "10px";
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#f9f9f9";

        card.innerHTML = `
            <strong>${task.title}</strong><br>
            Prioritas: ${task.priority || 'Normal'}<br>
            <small>Status: ${task.status || 'todo'}</small>
            ${task.ai_recommendation ? `<br><small>🤖 Rekomendasi AI: ${task.ai_recommendation}</small>` : ''}
        `;

        if (task.status === "todo") {
            todoList.appendChild(card);
        } else if (task.status === "doing") {
            doingList.appendChild(card);
        } else if (task.status === "done") {
            doneList.appendChild(card);
        }
    });
}

// ============ FUNGSI GROQ API ============
async function callGroqAPI(prompt, systemPrompt = "Kamu adalah asisten yang membantu manajemen tugas.") {
    try {
        const response = await fetch(GROQ_CONFIG.url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: GROQ_CONFIG.temperature,
                max_tokens: GROQ_CONFIG.max_tokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw error;
    }
}

// ============ ANALISIS TASKS DENGAN GROQ ============
async function analyzeTasksWithGroq(tasks, supabase) {
    try {
        document.body.innerHTML += "<p>🤖 Menganalisis tasks dengan AI...</p>";

        // Buat prompt berdasarkan tasks yang ada
        const taskSummary = tasks.map((t, i) => 
            `${i+1}. ${t.title} (Prioritas: ${t.priority || 'Normal'}, Status: ${t.status || 'todo'})`
        ).join('\n');

        const prompt = `
        Berikut adalah daftar tugas saat ini:
        ${taskSummary}

        Analisislah:
        1. Tugas mana yang paling prioritas untuk dikerjakan
        2. Berikan rekomendasi untuk setiap tugas
        3. Saran untuk manajemen waktu
        `;

        const analysis = await callGroqAPI(prompt, "Kamu adalah asisten manajemen proyek yang ahli.");

        // Tampilkan hasil analisis
        const analysisDiv = document.createElement('div');
        analysisDiv.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            background-color: #f0f8f0;
        `;
        analysisDiv.innerHTML = `
            <h3>🤖 Analisis AI (Groq)</h3>
            <pre style="white-space: pre-wrap; font-family: inherit;">${analysis}</pre>
        `;
        document.body.appendChild(analysisDiv);

        // Simpan analisis ke Supabase
        const { error: insertError } = await supabase
            .from('task_analyses')
            .insert([{
                analysis: analysis,
                task_count: tasks.length,
                analyzed_at: new Date().toISOString()
            }]);

        if (insertError) {
            console.warn('Gagal menyimpan analisis:', insertError);
        }

        return analysis;
    } catch (error) {
        console.error('Analisis gagal:', error);
        document.body.innerHTML += `
            <p style="color: orange;">⚠️ Gagal menganalisis tasks: ${error.message}</p>
        `;
        return null;
    }
}

// ============ GENERATE REKOMENDASI TASK BARU ============
async function generateTaskRecommendation(supabase) {
    try {
        document.body.innerHTML += "<p>💡 Menghasilkan rekomendasi task baru...</p>";

        const prompt = `Buatkan 3 saran tugas baru yang produktif untuk dikerjakan hari ini. 
        Berikan dalam format JSON array dengan field: title, priority (High/Medium/Low), dan estimated_time (dalam menit).`;

        const recommendations = await callGroqAPI(prompt, "Kamu adalah asisten produktivitas.");

        // Parse JSON dari response
        let parsedRecommendations;
        try {
            // Coba extract JSON dari response
            const jsonMatch = recommendations.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                parsedRecommendations = JSON.parse(jsonMatch[0]);
            } else {
                parsedRecommendations = JSON.parse(recommendations);
            }
        } catch (e) {
            // Jika bukan JSON, buat format manual
            parsedRecommendations = [
                { title: "Review dan prioritaskan tugas", priority: "High", estimated_time: 15 },
                { title: "Bersihkan dan rapikan workspace", priority: "Medium", estimated_time: 20 },
                { title: "Rencanakan tugas untuk besok", priority: "Low", estimated_time: 10 }
            ];
        }

        // Tampilkan rekomendasi
        const recDiv = document.createElement('div');
        recDiv.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #2196F3;
            border-radius: 8px;
            background-color: #f0f8ff;
        `;
        recDiv.innerHTML = `
            <h3>💡 Rekomendasi Tugas dari AI</h3>
            ${parsedRecommendations.map((rec, i) => `
                <div style="padding: 8px; margin: 5px 0; background: white; border-radius: 4px;">
                    <strong>${i+1}. ${rec.title}</strong><br>
                    Prioritas: ${rec.priority || 'Medium'} | Estimasi: ${rec.estimated_time || 15} menit
                    <button onclick="addTaskFromAI('${rec.title}', '${rec.priority || 'Medium'}')" 
                            style="margin-left: 10px; padding: 3px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        + Tambah
                    </button>
                </div>
            `).join('')}
        `;
        document.body.appendChild(recDiv);

        return parsedRecommendations;
    } catch (error) {
        console.error('Rekomendasi gagal:', error);
        return null;
    }
}

// ============ FUNGSI TAMBAH TASK DARI AI ============
window.addTaskFromAI = async function(title, priority) {
    try {
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title: title,
                priority: priority || 'Medium',
                status: 'todo',
                ai_recommendation: true,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        alert('✅ Task berhasil ditambahkan!');
        location.reload(); // Refresh untuk menampilkan task baru
    } catch (error) {
        alert('❌ Gagal menambahkan task: ' + error.message);
    }
};

// ============ TEST FUNGSI LAIN ============
async function testGroqSimple() {
    try {
        document.body.innerHTML += "<p>🧪 Testing Groq API dengan pertanyaan sederhana...</p>";
        
        const response = await callGroqAPI(
            "Apa itu manajemen tugas? Jelaskan dalam 2 kalimat.",
            "Kamu adalah asisten yang memberikan jawaban singkat dan jelas."
        );

        const testDiv = document.createElement('div');
        testDiv.style.cssText = `
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #FF9800;
            border-radius: 5px;
            background-color: #fff8e1;
        `;
        testDiv.innerHTML = `
            <strong>🧪 Test Groq API:</strong><br>
            ${response}
        `;
        document.body.appendChild(testDiv);
    } catch (error) {
        console.error('Test Groq gagal:', error);
    }
}

// ============ INISIALISASI ============
// Jalankan fungsi utama
testConnection();

// Jalankan test tambahan setelah 2 detik
setTimeout(() => {
    testGroqSimple();
}, 2000);

// ============ TAMBAHAN: TABEL UNTUK SUPABASE ============
/*
-- Buat tabel di Supabase untuk menyimpan analisis AI
CREATE TABLE task_analyses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    analysis TEXT NOT NULL,
    task_count INTEGER,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom ai_recommendation di tabel tasks
ALTER TABLE tasks ADD COLUMN ai_recommendation BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN ai_suggestion TEXT;
*/

async function testGroqConnection() {
    try {
        // 1. Koneksi ke Supabase
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        // 2. Ambil API key Groq dari tabel api_keys
        const { data: apiData, error: apiError } = await supabase
            .from("api_keys")
            .select("api_key")
            .eq("provider", "groq")
            .single();

        if (apiError) {
            document.body.innerHTML += `
                <div style="color: red; padding: 10px; border: 1px solid red; margin: 10px 0;">
                    <strong>❌ Gagal mengambil API Key:</strong><br>
                    ${apiError.message}
                </div>
            `;
            return;
        }

        const GROQ_API_KEY = apiData.api_key;
        document.body.innerHTML += `<p>✅ API Key Groq berhasil diambil dari database</p>`;

        // 3. Test koneksi ke Groq API
        document.body.innerHTML += `<p>🔄 Mengirim request ke Groq API...</p>`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu adalah asisten yang membantu testing API.'
                    },
                    {
                        role: 'user',
                        content: 'Balas dengan: "Koneksi Groq API berhasil! 🎉"'
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            })
        });

        // 4. Proses response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // 5. Tampilkan hasil di bagian bawah halaman
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            border: 3px solid #4CAF50;
            border-radius: 10px;
            background-color: #f0f8f0;
            font-family: Arial, sans-serif;
        `;
        resultDiv.innerHTML = `
            <h2 style="color: #2E7D32;">✅ Test Koneksi Groq API</h2>
            <hr>
            <p><strong>Status:</strong> <span style="color: green;">Berhasil</span></p>
            <p><strong>Response AI:</strong></p>
            <div style="padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                ${aiResponse}
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                <strong>Detail:</strong><br>
                Model: ${data.model}<br>
                Tokens digunakan: ${data.usage.total_tokens}<br>
                Waktu: ${new Date().toLocaleString()}
            </p>
        `;
        document.body.appendChild(resultDiv);

        console.log('✅ Test Groq API sukses:', data);

    } catch (err) {
        // Tampilkan error di bagian bawah
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            border: 3px solid #f44336;
            border-radius: 10px;
            background-color: #ffebee;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h2 style="color: #c62828;">❌ Test Koneksi Groq API Gagal</h2>
            <hr>
            <p><strong>Error:</strong></p>
            <pre style="padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto;">
${err.message}
            </pre>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                Waktu: ${new Date().toLocaleString()}
            </p>
        `;
        document.body.appendChild(errorDiv);

        console.error('❌ Test Groq API gagal:', err);
    }
}

// Jalankan test
testGroqConnection();
