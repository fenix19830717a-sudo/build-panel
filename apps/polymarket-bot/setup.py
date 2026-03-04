from setuptools import setup, find_packages

setup(
    name="polymarket-bot",
    version="0.1.0",
    description="Polymarket Trading Bot for BuildAI Platform",
    author="BuildAI",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.9",
)
