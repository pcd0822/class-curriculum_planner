exports.handler = async function(event) {
                    // POST 요청만 허용합니다.
                    if (event.httpMethod !== 'POST') {
                        return { statusCode: 405, body: 'Method Not Allowed' };
                    }

                    try {
                        // 클라이언트로부터 받은 프롬프트를 파싱합니다.
                        const { prompt } = JSON.parse(event.body);
                        
                        // Netlify 환경 변수에서 API 키를 가져옵니다.
                        const apiKey = process.env.OPENAI_API_KEY;

                        if (!apiKey) {
                            throw new Error('OpenAI API 키가 환경 변수에 설정되지 않았습니다.');
                        }

                        // OpenAI API에 보낼 요청 데이터를 구성합니다.
                        const payload = {
                            model: "gpt-4o",
                            messages: [{ "role": "user", "content": prompt }],
                            temperature: 0.7
                        };

                        // OpenAI API를 호출합니다.
                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            const errorBody = await response.json();
                            return {
                                statusCode: response.status,
                                body: JSON.stringify(errorBody)
                            };
                        }

                        const data = await response.json();

                        // 성공적인 응답을 클라이언트에 반환합니다.
                        return {
                            statusCode: 200,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        };

                    } catch (error) {
                        return {
                            statusCode: 500,
                            body: JSON.stringify({ message: error.message })
                        };
                    }
                };
