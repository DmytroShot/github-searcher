from openai import OpenAI
import json
from django.conf import settings

def get_grok_client():
    if not settings.GROK_API_KEY:
        raise ValueError("GROK_API_KEY is not set in environment variables.")
    return OpenAI(
        api_key=settings.GROK_API_KEY,
        base_url=settings.GROK_BASE_URL,
    )

# def analyze_repository_with_grok(repo_data: dict) -> dict:
#     """Формує промпт для аналізу репозиторію та повертає розширену JSON-аналітику."""
#     client = get_grok_client()

#     name = repo_data.get("title") or repo_data.get("name", "N/A")
#     stars = (
#         repo_data.get("stargazers_count")
#         if repo_data.get("stargazers_count") is not None
#         else repo_data.get("star_count", 0)
#     )
#     forks = (
#         repo_data.get("forks_count")
#         if repo_data.get("forks_count") is not None
#         else repo_data.get("fork_count", 0)
#     )

#     system_prompt = (
#         "Ти Senior Software Architect та Tech Lead. "
#         "Твоє завдання — проаналізувати репозиторій та надати детальну аналітику УКРАЇНСЬКОЮ МОВОЮ.\n\n"
#         "Поверни ВІДПОВІДЬ ТІЛЬКИ У ФОРМАТІ JSON з такою структурою:\n"
#         "{\n"
#         '  "summary": "Короткий AI-опис репозиторію — 2-4 речення загального висновку",\n'
#         '  "metrics": [\n'
#         '    { "label": "Stars", "value": "значення (наприклад 1.2k)" },\n'
#         '    { "label": "Forks", "value": "значення (наприклад 340)" },\n'
#         '    { "label": "Activity", "value": "High / Medium / Low" },\n'
#         '    { "label": "Popularity", "value": "оцінка/100 (наприклад 82/100)" }\n'
#         "  ],\n"
#         '  "strengths": [\n'
#         '    "Сильна сторона 1",\n'
#         '    "Сильна сторона 2"\n'
#         "  ],\n"
#         '  "risks": [\n'
#         '    "Ризик або слабке місце 1",\n'
#         '    "Ризик або слабке місце 2"\n'
#         "  ],\n"
#         '  "recommendations": [\n'
#         '    "Рекомендація 1",\n'
#         '    "Рекомендація 2"\n'
#         "  ]\n"
#         "}"
#     )

#     user_prompt = f"""
#     Проаналізуй наступний відкритий репозиторій:
#     - Назва: {name}
#     - ID: {repo_data.get('id', 'N/A')}
#     - Тип: {repo_data.get('type', 'repositories')}
#     - Провайдер: {repo_data.get('provider', 'github')}
#     - URL: {repo_data.get('url', 'N/A')}
#     - Аватарка: {repo_data.get('avatar_url', '')}
#     - Мова: {repo_data.get('language', 'Н/Д')}
#     - Зірки: {stars}
#     - Форки: {forks}
#     - Опис: {repo_data.get('description', 'Немає опису')}
#     """

#     response = client.chat.completions.create(
#         model=getattr(settings, "GROK_MODEL", "llama-3.3-70b-versatile"),
#         messages=[
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": user_prompt},
#         ],
#         response_format={"type": "json_object"},
#         temperature=0.2,
#     )

#     raw_content = response.choices[0].message.content

#     try:
#         return json.loads(raw_content)
#     except json.JSONDecodeError:
#         clean_content = (
#             raw_content.replace("```json", "").replace("```", "").strip()
#         )
#         return json.loads(clean_content)

def analyze_item_with_grok(data: dict) -> dict:
    """Універсальна функція аналізу через Groq (підтримує об'єкти 'repo' та 'user')."""
    client = get_grok_client()

    # Перевіряємо, який саме об'єкт передано в payload
    if "repo" in data:
        item_type = "repo"
        item = data["repo"]
    elif "users" in data:
        item_type = "users"
        item = data["users"]
    else:
        # Фолбек, якщо передано плаский словник
        item_type = data.get("type", "repo")
        item = data

    if item_type == "users":
        system_prompt = (
            "Ти Senior Tech Recruiter та Engineering Manager. "
            "Твоє завдання — проаналізувати профіль розробника/користувача GitHub/GitLab та надати детальну аналітику УКРАЇНСЬКОЮ МОВОЮ.\n\n"
            "Поверни ВІДПОВІДЬ ТІЛЬКИ У ФОРМАТІ JSON з такою структурою:\n"
            "{\n"
            '  "summary": "Короткий AI-опис профілю користувача — 2-4 речення загального висновку про його активність та стек",\n'
            '  "metrics": [\n'
            '    { "label": "Public Repos", "value": "кількість (наприклад 24)" },\n'
            '    { "label": "Followers", "value": "кількість (наприклад 150)" },\n'
            '    { "label": "Activity", "value": "High / Medium / Low" },\n'
            '    { "label": "Impact", "value": "оцінка/100 (наприклад 75/100)" }\n'
            "  ],\n"
            '  "strengths": [\n'
            '    "Сильна сторона профілю 1",\n'
            '    "Сильна сторона профілю 2"\n'
            "  ],\n"
            '  "risks": [\n'
            '    "Потенційне слабке місце 1 (наприклад: низька активність за останній рік)",\n'
            '    "Потенційне слабке місце 2"\n'
            "  ],\n"
            '  "recommendations": [\n'
            '    "Рекомендація щодо співпраці або перегляду проєктів 1",\n'
            '    "Рекомендація 2"\n'
            "  ]\n"
            "}"
        )

        user_prompt = f"""
        Проаналізуй профіль користувача:
        - Нікнейм/Логін: {item.get('login') or item.get('title') or 'N/A'}
        - Провайдер: {item.get('provider', 'github')}
        - URL: {item.get('url', 'N/A')}
        - Локація: {item.get('location', 'Н/Д')}
        - Аватарка: {item.get('avatar_url', '')}
        """

    else:  # item_type == "repo"
        system_prompt = (
            "Ти Senior Software Architect та Tech Lead. "
            "Твоє завдання — проаналізувати репозиторій та надати детальну аналітику УКРАЇНСЬКОЮ МОВОЮ.\n\n"
            "Поверни ВІДПОВІДЬ ТІЛЬКИ У ФОРМАТІ JSON з такою структурою:\n"
            "{\n"
            '  "summary": "Короткий AI-опис репозиторію — 2-4 речення загального висновку",\n'
            '  "metrics": [\n'
            '    { "label": "Stars", "value": "значення (наприклад 1.2k)" },\n'
            '    { "label": "Forks", "value": "значення (наприклад 340)" },\n'
            '    { "label": "Activity", "value": "High / Medium / Low" },\n'
            '    { "label": "Popularity", "value": "оцінка/100 (наприклад 82/100)" }\n'
            "  ],\n"
            '  "strengths": [\n'
            '    "Сильна сторона 1",\n'
            '    "Сильна сторона 2"\n'
            "  ],\n"
            '  "risks": [\n'
            '    "Ризик або слабке місце 1",\n'
            '    "Ризик або слабке місце 2"\n'
            "  ],\n"
            '  "recommendations": [\n'
            '    "Рекомендація 1",\n'
            '    "Рекомендація 2"\n'
            "  ]\n"
            "}"
        )

        stars = item.get("stargazers_count") or item.get("star_count", 0)
        forks = item.get("forks_count") or item.get("fork_count", 0)

        user_prompt = f"""
        Проаналізуй відкритий репозиторій:
        - Назва: {item.get('name') or item.get('title') or 'N/A'}
        - Провайдер: {item.get('provider', 'github')}
        - URL: {item.get('url', 'N/A')}
        - Мова: {item.get('language', 'Н/Д')}
        - Зірки: {stars}
        - Форки: {forks}
        - Опис: {item.get('description', 'Немає опису')}
        """

    response = client.chat.completions.create(
        model=getattr(settings, "GROK_MODEL", "llama-3.3-70b-versatile"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    raw_content = response.choices[0].message.content

    try:
        return json.loads(raw_content)
    except json.JSONDecodeError:
        clean_content = (
            raw_content.replace("```json", "").replace("```", "").strip()
        )
        return json.loads(clean_content)


def ask_grok_chat(user_message: str, history: list = None) -> str:
    """Обробляє загальні питання користувача про тренди, топ репозиторії тощо."""
    client = get_grok_client()
    
    messages = [
        {
            "role": "system", 
            "content": "Ти помічник-консультант з відкритих репозиторіїв GitHub та GitLab. Твоя мета — допомагати розробникам знаходити найкращі бібліотеки, фреймворки та інструменти. Відповідай чітко, структуруй відповіді списком або маркдауном."
        }
    ]
    
    # Якщо є історія повідомлень з чату
    if history:
        messages.extend(history)
        
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=messages,
        temperature=0.7,
    )
    return response.choices[0].message.content