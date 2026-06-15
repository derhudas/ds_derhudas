const SUPABASE_URL = "https://cyevvhoessdlplpiiwdc.supabase.co";

const SUPABASE_KEY = "sb_publishable_M138Ywr1_yqE6B5i10yEZw_nUsCgwU1";

document.body.innerHTML += "<p>Mencoba terhubung...</p>";

async function testConnection() {
    try {
        const supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .limit(3);

        if (error) {
            document.body.innerHTML += `
                <pre>Error:
${JSON.stringify(error, null, 2)}
                </pre>
            `;
            return;
        }

        document.body.innerHTML += `
            <h2>Berhasil mengambil ${data.length} data!</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;

    } catch (err) {
        document.body.innerHTML += `
            <pre>Exception:
${err.message}
            </pre>
        `;
    }
}

testConnection();