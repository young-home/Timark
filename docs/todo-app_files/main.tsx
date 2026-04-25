const StrictMode = __vite__cjsImport0_react["StrictMode"];const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];const _jsxDEV = __vite__cjsImport9_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=3819c75f";
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=97958d4d";
import { BrowserRouter, Routes, Route } from "/node_modules/.vite/deps/react-router-dom.js?v=08bb810b";
import { AuthProvider } from "/src/contexts/AuthContext.tsx";
import { ProtectedRoute } from "/src/components/ProtectedRoute.tsx";
import { Login } from "/src/pages/Login.tsx";
import { Register } from "/src/pages/Register.tsx";
import App from "/src/App.tsx?t=1777119288301";
import "/src/index.css";
var _jsxFileName = "D:/claude_workspace/todo/todo-app/src/main.tsx";
import __vite__cjsImport9_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=3819c75f";
createRoot(document.getElementById("root")).render(/* @__PURE__ */ _jsxDEV(StrictMode, { children: /* @__PURE__ */ _jsxDEV(BrowserRouter, { children: /* @__PURE__ */ _jsxDEV(AuthProvider, { children: /* @__PURE__ */ _jsxDEV(Routes, { children: [
	/* @__PURE__ */ _jsxDEV(Route, {
		element: /* @__PURE__ */ _jsxDEV(ProtectedRoute, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 16,
			columnNumber: 27
		}, this),
		children: /* @__PURE__ */ _jsxDEV(Route, {
			path: "/",
			element: /* @__PURE__ */ _jsxDEV(App, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 17,
				columnNumber: 38
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 17,
			columnNumber: 13
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 16,
		columnNumber: 11
	}, this),
	/* @__PURE__ */ _jsxDEV(Route, {
		path: "/login",
		element: /* @__PURE__ */ _jsxDEV(Login, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 19,
			columnNumber: 41
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 19,
		columnNumber: 11
	}, this),
	/* @__PURE__ */ _jsxDEV(Route, {
		path: "/register",
		element: /* @__PURE__ */ _jsxDEV(Register, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 20,
			columnNumber: 44
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 20,
		columnNumber: 11
	}, this)
] }, void 0, true, {
	fileName: _jsxFileName,
	lineNumber: 15,
	columnNumber: 9
}, this) }, void 0, false, {
	fileName: _jsxFileName,
	lineNumber: 14,
	columnNumber: 7
}, this) }, void 0, false, {
	fileName: _jsxFileName,
	lineNumber: 13,
	columnNumber: 5
}, this) }, void 0, false, {
	fileName: _jsxFileName,
	lineNumber: 12,
	columnNumber: 3
}, this));

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxlQUFlLFFBQVEsYUFBYTtBQUM3QyxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLHNCQUFzQjtBQUMvQixTQUFTLGFBQWE7QUFDdEIsU0FBUyxnQkFBZ0I7QUFDekIsT0FBTyxTQUFTO0FBQ2hCLE9BQU87OztBQUVQLFdBQVcsU0FBUyxlQUFlLE9BQU8sQ0FBRSxDQUFDLE9BQzNDLHdCQUFDLFlBQUQsWUFDRSx3QkFBQyxlQUFELFlBQ0Usd0JBQUMsY0FBRCxZQUNFLHdCQUFDLFFBQUQ7Q0FDRSx3QkFBQyxPQUFEO0VBQU8sU0FBUyx3QkFBQyxnQkFBRCxFQUFrQjs7Ozs7WUFDaEMsd0JBQUMsT0FBRDtHQUFPLE1BQUs7R0FBSSxTQUFTLHdCQUFDLEtBQUQsRUFBTzs7Ozs7R0FBSTs7Ozs7RUFDOUI7Ozs7O0NBQ1Isd0JBQUMsT0FBRDtFQUFPLE1BQUs7RUFBUyxTQUFTLHdCQUFDLE9BQUQsRUFBUzs7Ozs7RUFBSTs7Ozs7Q0FDM0Msd0JBQUMsT0FBRDtFQUFPLE1BQUs7RUFBWSxTQUFTLHdCQUFDLFVBQUQsRUFBWTs7Ozs7RUFBSTs7Ozs7Q0FDMUM7Ozs7VUFDSTs7OztVQUNEOzs7O1VBQ0w7Ozs7U0FDZCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJtYWluLnRzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdHJpY3RNb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSAncmVhY3QtZG9tL2NsaWVudCdcbmltcG9ydCB7IEJyb3dzZXJSb3V0ZXIsIFJvdXRlcywgUm91dGUgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IHsgQXV0aFByb3ZpZGVyIH0gZnJvbSAnLi9jb250ZXh0cy9BdXRoQ29udGV4dCdcbmltcG9ydCB7IFByb3RlY3RlZFJvdXRlIH0gZnJvbSAnLi9jb21wb25lbnRzL1Byb3RlY3RlZFJvdXRlJ1xuaW1wb3J0IHsgTG9naW4gfSBmcm9tICcuL3BhZ2VzL0xvZ2luJ1xuaW1wb3J0IHsgUmVnaXN0ZXIgfSBmcm9tICcuL3BhZ2VzL1JlZ2lzdGVyJ1xuaW1wb3J0IEFwcCBmcm9tICcuL0FwcCdcbmltcG9ydCAnLi9pbmRleC5jc3MnXG5cbmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSEpLnJlbmRlcihcbiAgPFN0cmljdE1vZGU+XG4gICAgPEJyb3dzZXJSb3V0ZXI+XG4gICAgICA8QXV0aFByb3ZpZGVyPlxuICAgICAgICA8Um91dGVzPlxuICAgICAgICAgIDxSb3V0ZSBlbGVtZW50PXs8UHJvdGVjdGVkUm91dGUgLz59PlxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCIvXCIgZWxlbWVudD17PEFwcCAvPn0gLz5cbiAgICAgICAgICA8L1JvdXRlPlxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2xvZ2luXCIgZWxlbWVudD17PExvZ2luIC8+fSAvPlxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL3JlZ2lzdGVyXCIgZWxlbWVudD17PFJlZ2lzdGVyIC8+fSAvPlxuICAgICAgICA8L1JvdXRlcz5cbiAgICAgIDwvQXV0aFByb3ZpZGVyPlxuICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgPC9TdHJpY3RNb2RlPixcbilcbiJdfQ==