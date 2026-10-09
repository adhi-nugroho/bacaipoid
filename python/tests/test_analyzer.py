import os
import sys
import types
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
llm_stub = types.ModuleType("llm")
llm_stub.ask_llm = lambda *args, **kwargs: None
sys.modules["llm"] = llm_stub

from analyzer import generate_analysis, validate_analysis


class AnalyzerDefaultsTest(unittest.TestCase):
    def test_unverified_analysis_stays_draft_without_invented_financial_data(self):
        result = generate_analysis(
            code="TEST",
            company_name="PT Test Tbk",
            sector="Teknologi",
            ipo_price=100,
            offering_shares=1_000_000,
            status="book_building",
            prospectus_url=None,
        )

        self.assertEqual("draft", result["publish_status"])
        self.assertIsNone(result["auditor_opinion"])
        self.assertIsNone(result["dilution_percentage"])
        self.assertIsNone(result["related_party_transaction_percentage"])
        self.assertEqual([], result["financials"])

        with self.assertRaisesRegex(ValueError, "belum lengkap"):
            validate_analysis(result)


if __name__ == "__main__":
    unittest.main()
