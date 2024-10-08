# frozen_string_literal: true

FactoryBot.define do
  factory :contact_form do |f|
    f.name { "Jeremy" }
    f.your_email { "jeremy@example.com" }
    f.to_email { "to@example.com" }
    f.subject { "Subject" }
  end

  factory :contact_competition do
    name { "Jon" }
    your_email { "jon@example.com" }

    transient do
      competition_contact { nil }
      competition_delegates { [] }
      competition_organizers { [] }
    end

    trait :with_invalid_competition_id do
      competition_id { "FooBar1900" }
    end

    trait :with_competition do
      competition_id { FactoryBot.create(:competition, :announced, contact: competition_contact, delegates: competition_delegates, organizers: competition_organizers).id }
    end
  end

  factory :contact_wct do
    name { "Jon" }
    your_email { "jon@example.com" }
  end

  factory :contact_wrt do
    name { "Jon" }
    your_email { "jon@example.com" }
  end

  factory :contact_wst do
    name { "Jon" }
    your_email { "jon@example.com" }
  end
end
