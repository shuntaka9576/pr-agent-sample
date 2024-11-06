from litellm import completion
from typing import Dict, List
import time
from datetime import datetime


def test_claude_models():
    models = [
        {"id": "anthropic.claude-3-sonnet-20240229-v1:0", "name": "Claude 3 Sonnet"},
        {"id": "anthropic.claude-3-haiku-20240307-v1:0", "name": "Claude 3 Haiku"},
        {"id": "anthropic.claude-3-opus-20240229-v1:0", "name": "Claude 3 Opus"},
    ]

    results: List[Dict] = []
    test_message = "Hello, how are you?"

    for model in models:
        print(f"\nTesting {model['name']} ({model['id']})...")
        try:
            start_time = time.time()

            response = completion(
                model=model["id"], messages=[{"content": test_message, "role": "user"}]
            )

            end_time = time.time()
            response_time = end_time - start_time

            result = {
                "model_name": model["name"],
                "model_id": model["id"],
                "status": "success",
                "response": response.choices[0].message.content
                if response.choices
                else None,
                "response_time": f"{response_time:.2f}s",
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            result = {
                "model_name": model["name"],
                "model_id": model["id"],
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

        results.append(result)
        print(f"Status: {result['status']}")
        if result["status"] == "success":
            print(f"Response time: {result['response_time']}")
            print(f"Response: {result['response'][:100]}...")
        else:
            print(f"Error: {result['error']}")


    return results


if __name__ == "__main__":
    results = test_claude_models()

    # 結果の集計を表示
    print("\n=== Summary ===")
    success_count = sum(1 for r in results if r["status"] == "success")
    print(f"Total models tested: {len(results)}")
    print(f"Successful requests: {success_count}")
    print(f"Failed requests: {len(results) - success_count}")

    # 成功したモデルの平均応答時間を計算
    response_times = [
        float(r["response_time"].rstrip("s"))
        for r in results
        if r["status"] == "success"
    ]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        print(f"Average response time: {avg_response_time:.2f}s")
