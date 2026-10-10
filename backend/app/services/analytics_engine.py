from typing import List, Dict, Any

class AnalyticsEngine:
    @staticmethod
    def extract_kpis(rows: List[Dict[str, Any]], columns: List[str]) -> List[Dict[str, Any]]:
        if not rows:
            return []
            
        kpis = []
        
        # Heuristic 1: If the query returned a single row with numeric aggregates, 
        # treat those directly as KPIs.
        if len(rows) == 1:
            row = rows[0]
            for col in columns:
                val = row[col]
                if isinstance(val, (int, float)):
                    # Format as currency if it sounds like money
                    is_money = any(m in col.lower() for m in ['revenue', 'profit', 'sales', 'cogs', 'cost', 'amount', 'price'])
                    formatted = f"₹{val:,.2f}" if is_money else f"{val:,}"
                    kpis.append({
                        "label": col.replace('_', ' ').title(),
                        "value": formatted
                    })
            return kpis

        # Heuristic 2: Aggregate across multiple rows
        total_revenue = 0.0
        total_profit = 0.0
        total_orders = 0
        has_revenue = False
        has_profit = False
        
        # Filter strictly for numeric columns to prevent date columns with "sales" in the name from hijacking the KPI
        num_cols = [c for c in columns if isinstance(rows[0].get(c), (int, float))]
        
        rev_col = next((c for c in num_cols if 'revenue' in c.lower() or 'sales' in c.lower() or 'total' in c.lower() or 'amount' in c.lower()), None)
        profit_col = next((c for c in num_cols if 'profit' in c.lower()), None)
        
        if rev_col:
            has_revenue = True
            for r in rows:
                if isinstance(r[rev_col], (int, float)):
                    total_revenue += r[rev_col]
                    
        if profit_col:
            has_profit = True
            for r in rows:
                if isinstance(r[profit_col], (int, float)):
                    total_profit += r[profit_col]
                    
        total_orders = len(rows) if 'order_id' in columns else 0
        
        if has_revenue:
            kpis.append({"label": "Total Calculated", "value": f"₹{total_revenue:,.2f}"})
        if has_profit:
            kpis.append({"label": "Total Profit", "value": f"₹{total_profit:,.2f}"})
        if has_revenue and has_profit and total_revenue > 0:
            margin = (total_profit / total_revenue) * 100
            kpis.append({"label": "Gross Margin", "value": f"{margin:.1f}%"})
            
        if total_orders > 0:
            kpis.append({"label": "Row Count / Orders", "value": f"{total_orders:,}"})
            
        return kpis

    @staticmethod
    def recommend_chart(rows: List[Dict[str, Any]], columns: List[str]) -> Dict[str, Any]:
        if not rows or len(rows) < 2 or len(columns) < 2:
            return None
            
        # Separate date/category and numeric columns
        date_cols = [c for c in columns if 'date' in c.lower() or 'month' in c.lower() or 'year' in c.lower()]
        cat_cols = [c for c in columns if isinstance(rows[0][c], str) and c not in date_cols]
        num_cols = [c for c in columns if isinstance(rows[0][c], (int, float))]
        
        if not num_cols:
            return None
            
        y_col = num_cols[0]
        
        chart_data = {
            "layout": {
                "title": f"{y_col.title()} Analysis",
                "template": "plotly_dark",
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "margin": {"l": 40, "r": 20, "t": 40, "b": 40}
            },
            "data": []
        }
        
        # Time-series -> Line chart
        if date_cols:
            x_col = date_cols[0]
            # sort by date
            try:
                sorted_rows = sorted(rows, key=lambda r: str(r[x_col]))
            except:
                sorted_rows = rows
                
            x_data = [r[x_col] for r in sorted_rows]
            y_data = [r[y_col] for r in sorted_rows]
            
            chart_data["data"].append({
                "x": x_data,
                "y": y_data,
                "type": "scatter",
                "mode": "lines+markers",
                "name": y_col.title(),
                "line": {"color": "#3b82f6"}
            })
            return chart_data
            
        # Category -> Bar chart
        if cat_cols:
            x_col = cat_cols[0]
            x_data = [r[x_col] for r in rows]
            y_data = [r[y_col] for r in rows]
            
            # Pie chart if <= 7 categories and positive percentages
            if len(rows) <= 7 and all(y > 0 for y in y_data if y is not None):
                chart_data["data"].append({
                    "labels": x_data,
                    "values": y_data,
                    "type": "pie",
                    "hole": 0.4,
                    "marker": {"colors": ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#6366f1", "#14b8a6"]}
                })
            else:
                chart_data["data"].append({
                    "x": x_data,
                    "y": y_data,
                    "type": "bar",
                    "marker": {"color": "#3b82f6"}
                })
            return chart_data
            
        return None
