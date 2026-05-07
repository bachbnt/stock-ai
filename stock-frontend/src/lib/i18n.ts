export type Locale = 'vi';

export const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
};

export const defaultLocale: Locale = 'vi';

const vi = {
  // Navbar
  nav_market: 'Thị trường',
  nav_portfolio: 'Danh mục',
  nav_login: 'Đăng nhập',
  nav_logout: 'Đăng xuất',

  // Auth modal
  auth_login: 'Đăng nhập',
  auth_signup: 'Đăng ký',
  auth_email: 'Email',
  auth_password: 'Mật khẩu',
  auth_email_invalid: 'Email không hợp lệ',
  auth_password_required: 'Vui lòng nhập mật khẩu',
  auth_password_min: 'Mật khẩu tối thiểu 8 ký tự',
  auth_password_letter: 'Mật khẩu phải có ít nhất 1 chữ cái',
  auth_password_digit: 'Mật khẩu phải có ít nhất 1 chữ số',
  auth_signup_success: 'Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.',
  auth_generic_error: 'Đã xảy ra lỗi',
  auth_processing: 'Đang xử lý...',
  auth_no_account: 'Chưa có tài khoản?',
  auth_has_account: 'Đã có tài khoản?',
  auth_password_hint: 'Tối thiểu 8 ký tự, có số và chữ',

  // Stock list
  stock_list_title: 'Danh sách Chứng khoán',
  stock_list_loading: 'Đang tải...',
  stock_list_count: '{n} mã',
  stock_list_updated: 'Cập nhật lúc {time}',
  stock_list_refresh: 'Làm mới',
  stock_list_search: 'Tìm theo mã hoặc tên công ty...',
  stock_list_error: 'Không thể tải dữ liệu. Kiểm tra kết nối tới máy chủ.',
  stock_list_col_no: '#',
  stock_list_col_symbol: 'Mã',
  stock_list_col_company: 'Tên công ty',
  stock_list_col_price: 'Giá khớp',
  stock_list_col_change: 'Biến động',
  stock_list_col_volume: 'KL giao dịch',
  stock_list_prev: 'Trước',
  stock_list_next: 'Tiếp',
  stock_list_page: 'Trang {page} / {total}',
  stock_list_footer: 'Giá tự động làm mới sau 2 phút · Nhấp vào mã để xem biểu đồ',

  // Stock detail
  detail_chart_title: 'Giá đóng cửa 90 ngày gần nhất',
  detail_no_history: 'Không có dữ liệu lịch sử.',
  detail_close: 'Đóng cửa',
  detail_tab_info: 'Thông tin',
  detail_tab_business: 'Kinh doanh',
  detail_tab_history: 'Lịch sử',
  detail_field_exchange: 'Sàn giao dịch',
  detail_field_company_type: 'Loại công ty',
  detail_field_listing_date: 'Ngày niêm yết',
  detail_field_founded_date: 'Ngày thành lập',
  detail_field_charter_capital: 'Vốn điều lệ (tỷ)',
  detail_field_employees: 'Số nhân viên',
  detail_field_ceo: 'Chủ tịch HĐQT',
  detail_field_ceo_title: 'Chức danh',
  detail_field_inspector: 'Kiểm soát viên',
  detail_field_auditor: 'Đơn vị kiểm toán',
  detail_field_tax_id: 'Mã số thuế',
  detail_field_phone: 'Điện thoại',
  detail_field_fax: 'Fax',
  detail_field_email: 'Email',
  detail_field_website: 'Website',
  detail_field_address: 'Địa chỉ',
  detail_field_branches: 'Chi nhánh / VPĐD',

  // Portfolio
  portfolio_title: 'Danh mục của tôi',
  portfolio_add_tx: 'Thêm giao dịch',
  portfolio_tab_holdings: 'Danh mục ({n})',
  portfolio_tab_transactions: 'Lịch sử giao dịch ({n})',
  portfolio_total_cost: 'Tổng vốn đầu tư',
  portfolio_total_value: 'Giá trị hiện tại',
  portfolio_unrealized_pnl: 'Lãi/lỗ chưa thực hiện',
  portfolio_realized_pnl: 'Lãi/lỗ đã thực hiện',

  // Holdings table
  holdings_empty: 'Chưa có cổ phiếu nào. Thêm giao dịch mua để bắt đầu.',
  holdings_col_symbol: 'Mã',
  holdings_col_qty: 'Số CP',
  holdings_col_avg_cost: 'Giá vốn TB',
  holdings_col_current_price: 'Giá hiện tại',
  holdings_col_value: 'Giá trị',
  holdings_col_pnl: 'Lãi/lỗ',
  holdings_col_pct: '%',

  // Transaction list
  tx_list_empty: 'Chưa có giao dịch nào.',
  tx_list_col_date: 'Ngày',
  tx_list_col_symbol: 'Mã',
  tx_list_col_type: 'Loại',
  tx_list_col_qty: 'Số CP',
  tx_list_col_price: 'Giá',
  tx_list_col_fee: 'Phí',
  tx_list_col_value: 'Giá trị',
  tx_list_col_note: 'Ghi chú',
  tx_type_buy: 'Mua',
  tx_type_sell: 'Bán',
  tx_delete_confirm: 'Xoá giao dịch này?',

  // Transaction modal
  tx_modal_title_add: 'Thêm giao dịch',
  tx_modal_title_edit: 'Sửa giao dịch',
  tx_modal_symbol_label: 'Mã cổ phiếu',
  tx_modal_symbol_placeholder: 'Tìm mã...',
  tx_modal_qty_label: 'Số lượng',
  tx_modal_qty_max: '(tối đa {max})',
  tx_modal_price_label: 'Giá (VND)',
  tx_modal_price_market: '· thị trường',
  tx_modal_fee_label: 'Phí (VND)',
  tx_modal_date_label: 'Ngày',
  tx_modal_note_label: 'Ghi chú (tuỳ chọn)',
  tx_modal_saving: 'Đang lưu...',
  tx_modal_btn_update: 'Cập nhật',
  tx_modal_btn_add_buy: 'Thêm lệnh mua',
  tx_modal_btn_add_sell: 'Thêm lệnh bán',
  tx_modal_err_symbol: 'Chọn mã cổ phiếu',
  tx_modal_err_qty: 'Số lượng phải > 0',
  tx_modal_err_price: 'Giá phải > 0',
  tx_modal_err_max_qty: 'Chỉ có thể bán tối đa {max} CP',
  tx_modal_err_generic: 'Đã xảy ra lỗi',

  // Portfolio chart
  chart_portfolio_title: 'Biến động giá trị danh mục (90 ngày)',
  chart_no_data: 'Không có dữ liệu lịch sử.',
  chart_value_label: 'Giá trị',
} as const;

export type TranslationKey = keyof typeof vi;
export const translations: Record<Locale, typeof vi> = { vi };
