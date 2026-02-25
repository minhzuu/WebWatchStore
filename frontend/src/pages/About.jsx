import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Award,
  Users,
  Clock,
  Heart,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function About() {
  const breadcrumbItems = [
    { label: "Về chúng tôi", isCurrent: true },
  ];

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Chất Lượng Cao Cấp",
      description:
        "Mỗi chiếc đồng hồ đều được kiểm tra kỹ lưỡng để đảm bảo chất lượng tốt nhất.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Phục Vụ Tận Tâm",
      description:
        "Đội ngũ nhân viên chuyên nghiệp luôn sẵn sàng hỗ trợ khách hàng 24/7.",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Giao Hàng Nhanh",
      description:
        "Cam kết giao hàng trong vòng 24-48 giờ trên toàn quốc với dịch vụ tốt nhất.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Đảm Bảo Hài Lòng",
      description:
        "Chính sách đổi trả linh hoạt và bảo hành chính hãng cho mọi sản phẩm.",
    },
  ];

  const milestones = [
    { year: "2020", title: "Thành Lập", description: "Bắt đầu hành trình với tầm nhìn về đồng hồ cao cấp" },
    { year: "2021", title: "500+ Sản Phẩm", description: "Mở rộng danh mục với hơn 500 mẫu đồng hồ đa dạng" },
    { year: "2022", title: "25k+ Khách Hàng", description: "Đạt mốc 25,000 khách hàng tin tưởng và sử dụng" },
    { year: "2024", title: "99% Hài Lòng", description: "Duy trì tỷ lệ hài lòng 99% từ phản hồi khách hàng" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-purple-50/30 to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-900" />
              <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                Về Chúng Tôi
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="font-serif">Sang Trọng Gặp Gỡ</span>
              <br />
              <span className="font-serif text-blue-900">Đổi Mới</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              Chúng tôi là địa chỉ tin cậy cho những ai yêu thích đồng hồ cao cấp.
              Với sứ mệnh mang đến những chiếc đồng hồ chất lượng, thiết kế đẳng cấp
              và dịch vụ hoàn hảo nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-900" />
                <h2 className="text-3xl font-bold text-gray-900">Sứ Mệnh</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Chúng tôi cam kết mang đến cho khách hàng những chiếc đồng hồ cao cấp
                với chất lượng vượt trội, thiết kế tinh tế và giá trị bền vững. Mỗi sản
                phẩm đều được tuyển chọn kỹ lưỡng để đảm bảo sự hài lòng tuyệt đối.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Với đội ngũ chuyên nghiệp và đam mê, chúng tôi không chỉ bán đồng hồ
                mà còn mang đến trải nghiệm mua sắm đẳng cấp và dịch vụ chăm sóc khách
                hàng tận tâm.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-purple-900" />
                <h2 className="text-3xl font-bold text-gray-900">Tầm Nhìn</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Trở thành thương hiệu đồng hồ hàng đầu tại Việt Nam, được khách hàng
                tin tưởng và yêu mến. Chúng tôi hướng tới việc xây dựng một cộng đồng
                những người yêu thích đồng hồ, nơi mọi người có thể chia sẻ đam mê và
                kiến thức.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Với sự đổi mới không ngừng, chúng tôi sẽ tiếp tục mở rộng danh mục sản
                phẩm và nâng cao chất lượng dịch vụ để đáp ứng mọi nhu cầu của khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những giá trị mà chúng tôi cam kết mang đến cho khách hàng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-blue-900 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Hành Trình Phát Triển
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những cột mốc quan trọng trong hành trình của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="relative text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl"
              >
                <div className="text-4xl font-bold text-blue-900 mb-2">
                  {milestone.year}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {milestone.title}
                </h3>
                <p className="text-gray-600">{milestone.description}</p>
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Sản phẩm chính hãng 100%, có giấy tờ đầy đủ",
              "Bảo hành chính thức từ nhà sản xuất",
              "Giao hàng nhanh chóng trên toàn quốc",
              "Đội ngũ tư vấn chuyên nghiệp, tận tâm",
              "Chính sách đổi trả linh hoạt trong 7 ngày",
              "Giá cả cạnh tranh, ưu đãi thường xuyên",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

